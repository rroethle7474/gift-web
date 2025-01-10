export interface RecommendedWishListItem {
    recommendItemId: number;
    userId: number;
    itemName: string;
    description?: string;
    productUrl?: string;
    productSrcImage?: string;
    estimatedCost?: number;
    defaultQuantity: number;
    isActive: boolean;
    dateAdded: Date;
    lastModified: Date;
}
