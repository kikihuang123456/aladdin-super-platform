/**
 * ALADDIN Enterprise V4
 *
 * Dealer ERP
 *
 * M05-11 Dealer Region Reassignment
 */


export interface DealerRegionReassignmentRequest {

  dealerId:
    string

  nextRegionId:
    string

  operatorId?:
    string | null

  remark?:
    string | null

}


export interface DealerRegionReassignmentSnapshot {

  assignmentId:
    string

  dealerId:
    string

  previousRegionId:
    string

  nextRegionId:
    string

  previousAssignedBy:
    string | null

  previousAssignedAt:
    string | null

  previousRemark:
    string | null

}


export interface DealerRegionReassignmentResponse {

  success:
    boolean

  dealerId:
    string

  previousRegionId:
    string | null

  nextRegionId:
    string | null

  snapshot?:
    DealerRegionReassignmentSnapshot

  message:
    string

  error?:
    string

}