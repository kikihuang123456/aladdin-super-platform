export interface DealerRegionDealer {


  id:string

  region_id:string

  dealer_id:string


  status:
  string


  assigned_at:
  string


  remark?:
  string



  members:{
    
    id:string

    name:string

    phone:string

    member_code:string

  }


}