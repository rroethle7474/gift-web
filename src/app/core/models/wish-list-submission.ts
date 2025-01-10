export interface WishListSubmission {
  submissionId: number;
  userId: number;
  statusId: number;
  isActive: boolean;
  submissionDate: Date;
  lastModified: Date;
  shipmentDate?: Date;
  reason: string;
  userName: string;
}
