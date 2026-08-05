/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-12 Dealer Region Unassignment
 */


export interface DealerRegionUnassignmentRequest {

  dealerId:
    string

  operatorId?:
    string | null

  remark?:
    string | null

}


export interface DealerRegionUnassignmentSnapshot {

  assignmentId:
    string

  dealerId:
    string

  previousRegionId:
    string

  previousAssignedBy:
    string | null

  previousAssignedAt:
    string | null

  previousRemark:
    string | null

}


export interface DealerRegionUnassignmentResponse {

  success:
    boolean

  dealerId:
    string

  previousRegionId:
    string | null

  snapshot?:
    DealerRegionUnassignmentSnapshot

  message:
    string

  error?:
    string

}