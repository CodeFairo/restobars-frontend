export interface DashBoardBanner {
  id: number;
  fraseBanner: string;
  urlBanner: string;  
  estadoBanner: boolean;
}

export interface DashBoardBannerResponse {
  banners: DashBoardBanner[];
}
