export interface CreateRecommendWishListItemDto {
    userId: number;
    itemName: string;
    description?: string;
    productUrl?: string;
    productSrcImage?: string;
    estimatedCost?: number;
    defaultQuantity: number;
    isActive: boolean;
}
