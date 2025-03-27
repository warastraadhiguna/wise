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

    public static function getStock($searchingText, $storeBranchId = 1, $perPage = 10, $page = 1)
    {
        $searchingText = trim($searchingText);
        $searchConditions = [];

        if (!empty($searchingText)) {
            $searchingByID = "SEARCHING_BY_ID";
            if (preg_match("/$searchingByID/", $searchingText)) {
                $id = str_replace($searchingByID, '', $searchingText);
                $searchConditions[] = "(a.id = '$id')";
            } else {
                $searchingTextArray = explode(" ", $searchingText); // Memisahkan kata-kata

                foreach ($searchingTextArray as $text) {
                    $searchConditions[] = "(a.code LIKE '%$text%' OR a.name LIKE '%$text%' OR b.name LIKE '%$text%' OR c.name LIKE '%$text%')";
                }
            }
        }

        // Gabungkan kondisi pencarian dengan 'AND' agar semua kata harus muncul
        $searchFilter = !empty($searchConditions) ? implode(" AND ", $searchConditions) : '1=1';


        $offset = ($page - 1) * $perPage;
        //query for return
        // ifnull((select sum(i.quantity) from transaction_details g
        // left join transactions h on g.transaction_id=h.id
        // left join transaction_detail_returns i on i.transaction_detail_id=g.id
        // where h.deleted_at is null and h.approve_transaction_date is not null
        // and g.product_id=a.id and h.store_branch_id=$storeBranchId),0) as transaction_return_quantity,

        $sql = "SELECT 
                a.id, 
                a.product_category_id, 
                a.brand_id, 
                a.unit_id,
                a.code, 
                a.name, 
                b.name AS product_category_name, 
                c.name AS brand_name, 
                d.name AS unit_name,

                -- 🔥 Perhitungan quantity berdasarkan storeBranchId
                CASE 
                    WHEN $storeBranchId = 1 
                        THEN COALESCE(purchase_quantity, 0) - COALESCE(distribution_quantity, 0) - COALESCE(transaction_quantity, 0) + COALESCE(mutation_quantity, 0) +   COALESCE(stock_opname_quantity, 0) - COALESCE(pdrq.purchase_detail_return_quantity, 0)
                 + COALESCE(tdrq.transaction_detail_return_quantity, 0)
                    ELSE COALESCE(distribution_quantity, 0) - COALESCE(transaction_quantity, 0) - COALESCE(mutation_quantity, 0) + COALESCE(stock_opname_quantity, 0) - COALESCE(pdrq.purchase_detail_return_quantity, 0)
                 + COALESCE(tdrq.transaction_detail_return_quantity, 0)
                END AS quantity,

                -- 🔥 Harga default
                COALESCE((SELECT value FROM product_price_relations i WHERE i.is_default=1 AND i.product_id=a.id), 0) AS price,

                -- 🔥 Harga terakhir berdasarkan pembelian terbaru
                COALESCE((
                    SELECT price FROM purchase_details j
                    LEFT JOIN purchases k ON j.purchase_id = k.id
                    WHERE j.product_id = a.id AND j.deleted_at IS NULL 
                        AND k.approve_purchase_date IS NOT NULL 
                    ORDER BY k.purchase_date DESC LIMIT 1
                ), 0) AS last_price

            FROM products a
            LEFT JOIN product_categories b ON a.product_category_id = b.id
            LEFT JOIN brands c ON a.brand_id = c.id
            INNER JOIN units d ON a.unit_id = d.id

            -- 🔥 Subquery untuk mendapatkan purchase_quantity
            LEFT JOIN (
                SELECT e.product_id, SUM(e.quantity) AS purchase_quantity 
                FROM purchase_details e
                LEFT JOIN purchases f ON e.purchase_id = f.id
                WHERE f.deleted_at IS NULL 
                    AND f.approve_purchase_date IS NOT NULL
                GROUP BY e.product_id
            ) AS pq ON pq.product_id = a.id

            -- 🔥 Subquery untuk mendapatkan distribution_quantity
            LEFT JOIN (
                SELECT g.product_id, SUM(g.quantity) AS distribution_quantity
                FROM distribution_details g
                LEFT JOIN distributions h ON g.distribution_id = h.id
                WHERE h.deleted_at IS NULL 
                    AND h.approve_date IS NOT NULL 
                    AND h.is_received = 1
                    " . ($storeBranchId == 1 ? "" : " AND h.store_branch_id = $storeBranchId ") .
                    "
                GROUP BY g.product_id
            ) AS dq ON dq.product_id = a.id

            -- 🔥 Subquery untuk mendapatkan transaction_quantity
            LEFT JOIN (
                SELECT g.product_id, SUM(g.quantity) AS transaction_quantity
                FROM transaction_details g
                LEFT JOIN transactions h ON g.transaction_id = h.id
                WHERE h.deleted_at IS NULL 
                    AND h.approve_transaction_date IS NOT NULL
                    AND h.store_branch_id = $storeBranchId
                GROUP BY g.product_id
            ) AS tq ON tq.product_id = a.id

            -- 🔥 Subquery untuk mendapatkan mutation_quantity (hanya jika storeBranchId != 1)
            LEFT JOIN (
                SELECT g.product_id, SUM(g.quantity) AS mutation_quantity
                FROM mutation_details g
                LEFT JOIN mutations h ON g.mutation_id = h.id
                WHERE h.deleted_at IS NULL 
                    AND h.approve_date IS NOT NULL 
                    AND h.is_received = 1
                    " . ($storeBranchId == 1 ? "" : " AND h.store_branch_id = $storeBranchId") .
                    " 
                GROUP BY g.product_id
            ) AS mq ON mq.product_id = a.id

            -- 🔥 Subquery untuk mendapatkan stock_opname_quantity
            LEFT JOIN (
                SELECT sod.product_id, sum(sod.quantity) as stock_opname_quantity FROM stock_opname_details sod
                inner join stock_opnames so on sod.stock_opname_id=so.id
                WHERE so.deleted_at IS NULL
                AND so.approve_stock_opname_date IS NOT NULL
                AND so.store_branch_id = $storeBranchId
                group by sod.product_id                
            ) AS soq ON soq.product_id = a.id

            -- Subquery untuk purchase_detail_returns
            LEFT JOIN (
                SELECT pd.product_id, SUM(pdr.quantity) AS purchase_detail_return_quantity
                FROM purchase_detail_returns pdr
                INNER JOIN purchase_details pd ON pdr.purchase_detail_id = pd.id
                INNER JOIN purchases f ON pd.purchase_id = f.id
                WHERE f.deleted_at IS NULL 
                    AND f.approve_purchase_date IS NOT NULL                
                GROUP BY pd.product_id
            ) AS pdrq ON pdrq.product_id = a.id

            -- Subquery untuk transaction_detail_returns
            LEFT JOIN (
                SELECT td.product_id, SUM(tdr.quantity) AS transaction_detail_return_quantity
                FROM transaction_detail_returns tdr
                INNER JOIN transaction_details td ON tdr.transaction_detail_id = td.id
                INNER JOIN transactions h ON td.transaction_id = h.id
                WHERE h.deleted_at IS NULL 
                    AND h.approve_transaction_date IS NOT NULL
                    AND h.store_branch_id = $storeBranchId                
                GROUP BY td.product_id
            ) AS tdrq ON tdrq.product_id = a.id

            WHERE a.deleted_at IS NULL 
            AND ($searchFilter)
            ORDER BY a.name
            LIMIT $perPage OFFSET $offset";

        // Konversi hasil query menjadi collection agar bisa digunakan method Collection
        $items = collect(DB::select($sql));

        // Ambil semua kategori harga
        $priceCategories = PriceCategory::get();

        // Ambil semua id produk dari $items
        $stockIds = $items->pluck('id')->toArray();

        // Ambil semua ProductPriceRelation untuk produk-produk tersebut dalam satu query, kemudian group by product_id
        $productPriceRelations = ProductPriceRelation::whereIn('product_id', $stockIds)->get()->groupBy('product_id');

        // Map setiap stock dan tambahkan field baru untuk setiap kategori harga
        $items = $items->map(function ($item) use ($priceCategories, $productPriceRelations) {
            // Dapatkan relasi harga untuk produk ini (jika ada)
            $relations = $productPriceRelations->get($item->id, collect());

            foreach ($priceCategories as $priceCategory) {
                // Cari relasi untuk kategori harga tertentu
                $relation = $relations->firstWhere('price_category_id', $priceCategory->id);
                // Tetapkan nilai, jika tidak ada, gunakan 0
                $item->{"priceCategory_{$priceCategory->id}"} = $relation ? $relation->value : 0;
            }
            return $item;
        });


        ///////////////////////////////

        $totalSql = "SELECT COUNT(*) AS aggregate 
            FROM products a
            left join product_categories b on a.product_category_id=b.id
            left join brands c on a.brand_id=c.id
            inner join units d on a.unit_id=d.id
            where a.deleted_at is null AND ($searchFilter) ";

        $totalCount = DB::select($totalSql)[0]->aggregate;
        $stock = new LengthAwarePaginator($items, $totalCount, $perPage, $page, [
            'path' => request()->url(),
            'query' => request()->query(),
        ]);

        return $stock;
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
        //
        $mainQuery = "SELECT
                pd.id, pd.product_id,pd.quantity,
                -- Total setelah semua diskon diterapkan
                ((pd.quantity * (pd.price - COALESCE(pd.discount, 0) - (pd.price * COALESCE(pd.discount_percent, 0) / 100)))
                * (1 - (COALESCE(p.discount_percent, 0) / 100)))
                - (COALESCE(p.discount, 0) * (
                    ((pd.quantity * (pd.price - COALESCE(pd.discount, 0) - (pd.price * COALESCE(pd.discount_percent, 0) / 100)))
                    * (1 - (COALESCE(p.discount_percent, 0) / 100)))
                    / (SELECT SUM(pd2.quantity * (pd2.price - COALESCE(pd2.discount, 0) - (pd2.price * COALESCE(pd2.discount_percent, 0) / 100))
                        * (1 - (COALESCE(p.discount_percent, 0) / 100)))
                        FROM purchase_details pd2 WHERE pd2.purchase_id = p.id)
                )) AS total_after_all_discounts
            FROM purchase_details pd
            INNER JOIN purchases p
                ON pd.purchase_id = p.id
            WHERE
                pd.deleted_at IS NULL
                AND p.deleted_at IS NULL
                AND p.approve_purchase_date IS NOT NULL and pd.product_id=$productId";

        $query = "SELECT id, (total_after_all_discounts)/(quantity) as price from
                ($mainQuery)as allData  order by id desc";

        $allPurchaseDetailsByProductId = DB::select($query);

        $query = "SELECT product_id, sum(total_after_all_discounts)/sum(quantity) as average_price from
                ($mainQuery)as allData group by product_id";
        $averagePriceByProductId = DB::select($query);

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

        return [
            "product" => Product::withTrashed()->with('unit')->find($productId),
            "average_price" => $averagePriceByProductId && sizeOf($averagePriceByProductId) > 0 ? $averagePriceByProductId[0]->average_price : 0,
            "last_price" => $allPurchaseDetailsByProductId && sizeOf($allPurchaseDetailsByProductId) > 0 ? $allPurchaseDetailsByProductId[0]->price : 0,
            "prices"    => $prices
        ];
    }

    public static function checkSufficientStock($storeBranchId, $details)
    {
        $insufficientProductStock  = null;
        foreach ($details as $detail) {
            if (self::getStock("SEARCHING_BY_ID". $detail->product->id, $storeBranchId)->items()[0]->quantity - $detail->quantity < 0) {
                $insufficientProductStock = $detail->product;
                break;
            }
        }
        if ($insufficientProductStock) {
            return "Product {$insufficientProductStock->name}({$insufficientProductStock->code}) tidak cukup!!";
        }

        return "";
    }

    public static function getStockHistories($stockId, $searchingText, $storeBranchId = 1, $perPage = 10, $page = 1)
    {
        $offset = ($page - 1) * $perPage;

        $sql = "select * from
            (" .
            ($storeBranchId == 1 ? "SELECT 'purchase' as category, CONCAT('+',e.quantity) as quantity, f.purchase_date as 'date'
            FROM purchase_details e
            LEFT JOIN purchases f ON e.purchase_id = f.id
            WHERE f.deleted_at IS NULL and e.deleted_at is NULL
            AND f.approve_purchase_date IS NOT NULL
            and product_id=$stockId  union all" : "") ." 

            SELECT 'distribution' as category,  CONCAT('". ($storeBranchId == 1 ? "-" : "+"). "',g.quantity) as quantity, h.distribution_date as 'date'
            FROM distribution_details g
            LEFT JOIN distributions h ON g.distribution_id = h.id
            WHERE h.deleted_at IS NULL
            AND h.approve_date IS NOT NULL
            AND h.is_received = 1
            " . ($storeBranchId == 1 ? "" : " AND h.store_branch_id = $storeBranchId") . "
            AND product_id=$stockId

            union all
            SELECT 'transaction' as category, CONCAT('-',g.quantity) as quantity, h.transaction_date as 'date'
            FROM transaction_details g
            LEFT JOIN transactions h ON g.transaction_id = h.id
            WHERE h.deleted_at IS NULL
            AND h.approve_transaction_date IS NOT NULL
            AND h.store_branch_id = $storeBranchId
            AND product_id=$stockId

            union all
            SELECT 'mutation' as category, CONCAT('". ($storeBranchId == 1 ? "+" : "-"). "',g.quantity) AS mutation_quantity, h.mutation_date as 'date'
            FROM mutation_details g
            LEFT JOIN mutations h ON g.mutation_id = h.id
            WHERE h.deleted_at IS NULL
            AND h.approve_date IS NOT NULL
            AND h.is_received = 1
            AND product_id=$stockId
            AND (h.store_branch_id ". ($storeBranchId == 1 ? "!" : ""). "= $storeBranchId)

            union all
            SELECT 'stock opname' as category,  CONCAT('+',sod.quantity) as quantity, so.stock_opname_date as 'date' FROM stock_opname_details sod
            inner join stock_opnames so on sod.stock_opname_id=so.id
            WHERE so.deleted_at IS NULL
            AND so.approve_stock_opname_date IS NOT NULL
            AND so.store_branch_id = $storeBranchId
            AND product_id=$stockId      
            
            
            union all
                SELECT 'purchase return' as category,  CONCAT('-',pdr.quantity) AS quantity, pdr.created_at as 'date'
                FROM purchase_detail_returns pdr
                INNER JOIN purchase_details pd ON pdr.purchase_detail_id = pd.id
                INNER JOIN purchases f ON pd.purchase_id = f.id
                WHERE f.deleted_at IS NULL 
                    AND f.approve_purchase_date IS NOT NULL                
                AND product_id=$stockId     

            union all    
                SELECT 'transaction return' as category, CONCAT('+',tdr.quantity) AS quantity, tdr.created_at as 'date'
                FROM transaction_detail_returns tdr
                INNER JOIN transaction_details td ON tdr.transaction_detail_id = td.id
                INNER JOIN transactions h ON td.transaction_id = h.id
                WHERE h.deleted_at IS NULL 
                    AND h.approve_transaction_date IS NOT NULL
                    AND h.store_branch_id = $storeBranchId                
                AND product_id=$stockId     

            ) as summary_view
        

            where category like '%$searchingText%'
            ORDER BY `date` desc";

        // Konversi hasil query menjadi collection agar bisa digunakan method Collection
        $items = collect(DB::select("$sql LIMIT $perPage OFFSET $offset"));
        $totalCount = sizeOf(DB::select($sql));
        $stock = new LengthAwarePaginator($items, $totalCount, $perPage, $page, [
            'path' => request()->url(),
            'query' => request()->query(),
        ]);
        return $stock;
    }
}
// this is how to calculate total_after_all_discounts
// SELECT
//     pd.product_id,
//     pd.quantity,
//     pd.price,
//     pd.discount AS detail_discount_nominal,
//     pd.discount_percent AS detail_discount_percent,
//     p.discount AS purchase_discount_nominal,
//     p.discount_percent AS purchase_discount_percent,

//     -- Harga setelah diskon dari purchase_details
//     (pd.price - COALESCE(pd.discount, 0) - (pd.price * COALESCE(pd.discount_percent, 0) / 100)) AS price_after_detail_discount,

//     -- Total harga sebelum diskon purchases diterapkan
//     pd.quantity * (pd.price - COALESCE(pd.discount, 0) - (pd.price * COALESCE(pd.discount_percent, 0) / 100)) AS total_before_purchase_discount,

//     -- Total setelah diskon persen dari purchases diterapkan
//     (pd.quantity * (pd.price - COALESCE(pd.discount, 0) - (pd.price * COALESCE(pd.discount_percent, 0) / 100)))
//     * (1 - (COALESCE(p.discount_percent, 0) / 100)) AS total_after_purchase_percent_discount,

//     -- Proporsi diskon nominal berdasarkan harga setelah diskon persen
//     (COALESCE(p.discount, 0) * (
//         ((pd.quantity * (pd.price - COALESCE(pd.discount, 0) - (pd.price * COALESCE(pd.discount_percent, 0) / 100)))
//         * (1 - (COALESCE(p.discount_percent, 0) / 100)))
//         / (SELECT SUM(pd2.quantity * (pd2.price - COALESCE(pd2.discount, 0) - (pd2.price * COALESCE(pd2.discount_percent, 0) / 100))
//             * (1 - (COALESCE(p.discount_percent, 0) / 100)))
//             FROM purchase_details pd2 WHERE pd2.purchase_id = p.id)
//     )) AS allocated_nominal_discount,

//     -- Total setelah semua diskon diterapkan
//     ((pd.quantity * (pd.price - COALESCE(pd.discount, 0) - (pd.price * COALESCE(pd.discount_percent, 0) / 100)))
//     * (1 - (COALESCE(p.discount_percent, 0) / 100)))
//     - (COALESCE(p.discount, 0) * (
//         ((pd.quantity * (pd.price - COALESCE(pd.discount, 0) - (pd.price * COALESCE(pd.discount_percent, 0) / 100)))
//         * (1 - (COALESCE(p.discount_percent, 0) / 100)))
//         / (SELECT SUM(pd2.quantity * (pd2.price - COALESCE(pd2.discount, 0) - (pd2.price * COALESCE(pd2.discount_percent, 0) / 100))
//             * (1 - (COALESCE(p.discount_percent, 0) / 100)))
//             FROM purchase_details pd2 WHERE pd2.purchase_id = p.id)
//     )) AS total_after_all_discounts



// FROM purchase_details pd
// INNER JOIN purchases p
//     ON pd.purchase_id = p.id
// WHERE
//     pd.deleted_at IS NULL
//     AND p.deleted_at IS NULL
//     AND p.approve_purchase_date IS NOT NULL
