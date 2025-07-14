import React from 'react'

type ProductInfoProps = {
    product: {
        _id: string
        store_id: string
        product_code: string
        name: string
        brand: string
        ingredients: string
        price: number
        stock: number
        variants: string[]
        comparison_tags: string[]
        shelf_location: string
    }
}

function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div className="max-w-md mx-auto mb-6">
            <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-4">
                        <span className="text-2xl font-bold text-white">{product.name[0]}</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Brand: <span className="font-medium">{product.brand}</span>
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Product Code:</span>
                        <div className="font-mono text-gray-900 dark:text-white">{product.product_code}</div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Store ID:</span>
                        <div className="font-mono text-gray-900 dark:text-white">{product.store_id}</div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Price:</span>
                        <div className="font-semibold text-primary">{`₹${product.price.toFixed(2)}`}</div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Stock:</span>
                        <div className="font-semibold text-green-600 dark:text-green-400">{product.stock}</div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Variants:</span>
                        <div className="flex flex-wrap gap-1">
                            {product.variants.map((variant) => (
                                <span key={variant} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                                    {variant}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Shelf:</span>
                        <div className="text-gray-900 dark:text-white">{product.shelf_location}</div>
                    </div>
                </div>
                <div className="mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Ingredients:</span>
                    <div className="text-gray-900 dark:text-white">{product.ingredients}</div>
                </div>
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {product.comparison_tags.map((tag) => (
                            <span
                                key={tag}
                                className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                    Product ID: <span className="font-mono">{product._id}</span>
                </div>
            </div>
        </div>
    )
}

export default ProductInfo