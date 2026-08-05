/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-10 Dealer Region Batch Assignment
 */


export interface DealerRegionBatchAssignmentRequest {

  regionId:
    string

  dealerIds:
    string[]

  remark?:
    string | null

}



export interface DealerRegionBatchAssignmentSuccessItem {

  dealerId:
    string

  assignmentId:
    string

  regionId:
    string

}



export interface DealerRegionBatchAssignmentFailureItem {

  dealerId:
    string

  message:
    string

}



export interface DealerRegionBatchAssignmentResponse {

  success:
    boolean

  regionId:
    string

  requestedCount:
    number

  successCount:
    number

  failureCount:
    number

  successfulItems:
    DealerRegionBatchAssignmentSuccessItem[]

  failedItems:
    DealerRegionBatchAssignmentFailureItem[]

  message:
    string

  error?:
    string

}