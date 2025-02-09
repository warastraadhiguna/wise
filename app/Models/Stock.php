<?php

namespace App\Models;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Stock extends Model
{
    use HasFactory;
    use Notifiable;

    public static function getStock($searchingText, $perPage, $page, $storeBranchId = 1)
    {

        $searchingText = trim($searchingText);
        $searchConditions = [];

        if (!empty($searchingText)) {
            $searchingTextArray = explode(" ", $searchingText); // Memisahkan kata-kata

            foreach ($searchingTextArray as $text) {
                $searchConditions[] = "(a.code LIKE '%$text%' OR a.name LIKE '%$text%' OR b.name LIKE '%$text%' OR c.name LIKE '%$text%')";
            }
        }

        // Gabungkan kondisi pencarian dengan 'AND' agar semua kata harus muncul
        $searchFilter = !empty($searchConditions) ? implode(" AND ", $searchConditions) : '1=1';


        $offset = ($page - 1) * $perPage;

        $sql = $storeBranchId == 1 ?
            "SELECT *, purchase_quantity-transaction_quantity as quantity from (SELECT a.id, a.product_category_id, a.brand_id, a.unit_id, a.code, a.name,
            b.name as product_category_name, c.name as brand_name, d.name as unit_name,

            ifnull((select sum(quantity) from purchase_details e
            left join purchases f on e.purchase_id=f.id
            where f.deleted_at is null and f.approve_purchase_date is not null and a.id=e.product_id),0)  as purchase_quantity,

            ifnull((select sum(quantity) from transaction_details g
            left join transactions h on g.transaction_id=h.id
            where h.deleted_at is null and h.approve_transaction_date is not null and a.id=g.product_id),0) as transaction_quantity,

            ifnull((SELECT value FROM product_price_relations i where i.is_default=1 and i.product_id=a.id),0) as price, 

            ifnull((SELECT price FROM purchase_details j
            left join purchases k on j.purchase_id=k.id
            where j.product_id=a.id and j.deleted_at is null and k.approve_purchase_date is not null order by k.purchase_date desc limit 1),0) as last_price

            FROM products a
            left join product_categories b on a.product_category_id=b.id
            left join brands c on a.brand_id=c.id
            inner join units d on a.unit_id=d.id
            where a.deleted_at is null AND ($searchFilter)) as total_stock
            order by name
            LIMIT $perPage OFFSET $offset"
            :
            "";

        // dd($sql);
        $items = DB::select($sql);

        $totalSql = "SELECT COUNT(*) AS aggregate 
            FROM products a
            left join product_categories b on a.product_category_id=b.id
            left join brands c on a.brand_id=c.id
            inner join units d on a.unit_id=d.id
            where a.deleted_at is null AND ($searchFilter) ";

        $totalCount = DB::select($totalSql)[0]->aggregate;
        $purchasing = new LengthAwarePaginator($items, $totalCount, $perPage, $page, [
            'path' => request()->url(),
            'query' => request()->query(),
        ]);

        return $purchasing;
    }

    public static function getTransactionStock($searchingText, $perPage, $page, $storeBranchId = 1)
    {

        $searchingText = trim($searchingText);
        $searchConditions = [];

        if (!empty($searchingText)) {
            $searchingTextArray = explode(" ", $searchingText); // Memisahkan kata-kata

            foreach ($searchingTextArray as $text) {
                $searchConditions[] = "(c.code LIKE '%$text%' OR c.name LIKE '%$text%' OR d.name LIKE '%$text%' OR e.name LIKE '%$text%')";
            }
        }

        // Gabungkan kondisi pencarian dengan 'AND' agar semua kata harus muncul
        $searchFilter = !empty($searchConditions) ? implode(" AND ", $searchConditions) : '1=1';


        $offset = ($page - 1) * $perPage;

        $sql = "SELECT *, ifnull((SELECT value FROM product_price_relations where is_default=1 and product_price_relations.product_id=purchasing.id),0) as price from
            (select c.id, c.user_id, c.product_category_id, c.brand_id, c.unit_id, c.code, c.name, c.note, d.name as category_name, e.name as brand_name, f.name as unit_name, sum(a.quantity) as quantity
            from purchase_details a
            inner join purchases b on a.purchase_id=b.id
            inner join products c on a.product_id=c.id
            left join product_categories d on c.product_category_id=d.id
            left join brands e on c.brand_id=e.id
            inner join units f on c.unit_id=f.id
            where b.approve_purchase_date is not null and a.deleted_at is null and b.deleted_at is null AND ($searchFilter) and b.store_branch_id = $storeBranchId
            group by c.id, c.user_id, c.product_category_id, c.brand_id, c.unit_id, c.code, c.name, c.note, d.name, e.name, f.name) as purchasing  order by name LIMIT $perPage OFFSET $offset";

        $items = DB::select($sql);

        $totalSql = "SELECT COUNT(*) AS aggregate FROM
            (SELECT c.id
            FROM purchase_details a
            INNER JOIN purchases b ON a.purchase_id = b.id
            INNER JOIN products c ON a.product_id = c.id
            left join product_categories d on c.product_category_id=d.id
            left join brands e on c.brand_id=e.id
            WHERE b.approve_purchase_date IS NOT NULL 
            AND a.deleted_at IS NULL 
            AND b.deleted_at IS NULL AND ($searchFilter)  
            and b.store_branch_id = $storeBranchId
            GROUP BY c.id) AS purchasing";

        $totalCount = DB::select($totalSql)[0]->aggregate;
        $purchasing = new LengthAwarePaginator($items, $totalCount, $perPage, $page, [
            'path' => request()->url(),
            'query' => request()->query(),
        ]);

        return $purchasing;
    }

    public static function getStockInfo($productId)
    {
        if (!$productId) {
            return null;
        }

        $query = "SELECT
    a.id, a.code, a.name,
    d.name AS unit_name,
    IFNULL(SUM(pi.quantity), NULL) AS quantity,
    IFNULL(SUM(pi.adjusted_price * pi.quantity) / NULLIF(SUM(pi.quantity), 0), NULL) AS average_price,
    (
        SELECT 
            subquery.adjusted_price
        FROM 
            (
                SELECT 
                    pd.product_id,
                    pd.quantity,
                    (
                        ((pd.price * (1 - IFNULL(pd.discount_percent, 0) / 100)) - IFNULL(pd.discount, 0)) *
                        (1 - IFNULL(p.discount_percent, 0) / 100) -
                        (
                            IFNULL(p.discount, 0) * 
                            (((pd.price * (1 - IFNULL(pd.discount_percent, 0) / 100)) - IFNULL(pd.discount, 0)) /
                                NULLIF(
                                    (
                                        SELECT 
                                            SUM(
                                                (pd_sub.price * (1 - IFNULL(pd_sub.discount_percent, 0) / 100)) - IFNULL(pd_sub.discount, 0)
                                            )
                                        FROM 
                                            purchase_details pd_sub
                                        WHERE 
                                            pd_sub.purchase_id = p.id
                                            AND pd_sub.deleted_at IS NULL
                                    ),
                                    0
                                )
                            )
                        ) *
                        (1 + IFNULL(p.ppn, 0) / 100)
                    ) AS adjusted_price,
                    p.purchase_date
                FROM 
                    purchase_details pd
                INNER JOIN purchases p 
                    ON pd.purchase_id = p.id
                WHERE 
                    pd.deleted_at IS NULL
                    AND p.deleted_at IS NULL
                    AND p.approve_purchase_date IS NOT NULL
            ) AS subquery
        WHERE 
            subquery.product_id = a.id
        ORDER BY 
            subquery.purchase_date DESC
        LIMIT 1
    ) AS last_price
FROM
    products a
LEFT JOIN (
    SELECT 
        pd.product_id,
        pd.quantity,
        (
            ((pd.price * (1 - IFNULL(pd.discount_percent, 0) / 100)) - IFNULL(pd.discount, 0)) *
            (1 - IFNULL(p.discount_percent, 0) / 100) -
            (
                IFNULL(p.discount, 0) * 
                (((pd.price * (1 - IFNULL(pd.discount_percent, 0) / 100)) - IFNULL(pd.discount, 0)) /
                    NULLIF(
                        (
                            SELECT 
                                SUM(
                                    (pd_sub.price * (1 - IFNULL(pd_sub.discount_percent, 0) / 100)) - IFNULL(pd_sub.discount, 0)
                                )
                            FROM 
                                purchase_details pd_sub
                            WHERE 
                                pd_sub.purchase_id = p.id
                                AND pd_sub.deleted_at IS NULL
                        ),
                        0
                    )
                )
            ) *
            (1 + IFNULL(p.ppn, 0) / 100)
        ) AS adjusted_price
    FROM 
        purchase_details pd
    INNER JOIN purchases p 
        ON pd.purchase_id = p.id
    WHERE
        pd.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND p.approve_purchase_date IS NOT NULL
) pi
    ON pi.product_id = a.id
INNER JOIN units d
    ON a.unit_id = d.id
WHERE
    a.id = $productId
GROUP BY
    a.id, d.name, a.code, a.name
ORDER BY
    a.id;";
        // dd($query);
        $stocks = DB::select($query);
        // sum(a.quantity*a.price)/sum(a.quantity) as averagePrice
        // $averagePrice = 0;
        // $totalValue = 0;
        // $quantityTotal = 0;
        // foreach ($stocks as $stock) {
        //     $quantityTotal += $stock->quantity;
        //     $totalValue  += $stock->quantity * $stock->price;
        // }

        // if ($totalValue > 0 && $quantityTotal > 0) {
        //     $averagePrice = $totalValue / $quantityTotal;
        // }

        $query = "SELECT b.id, ifNull(b.product_id,$productId) as product_id, a.id as price_category_id, a.name, ifNull(b.value, 0) as value, ifNull(b.is_default,0) as is_default FROM price_categories a left join product_price_relations b on a.id=b.price_category_id and product_id=$productId order by a.index ";

        $prices = DB::select($query);

        $isDefaultExist = false;
        foreach ($prices as $price) {
            if ($price->is_default && $price->is_default == "1") {
                $isDefaultExist = true;
            }
        }
        if (!$isDefaultExist) {
            if (sizeOf($prices) > 0) {
                $prices[0]->is_default = "1";
            }
        }
        // dd(sizeOf($stocks));
        return [
            "lastInfo" => $stocks && sizeOf($stocks) > 0 ? $stocks[0] : null,
            "prices"    => $prices
        ];
    }


}
