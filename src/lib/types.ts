// Centralized type definitions for the application

interface Metric {
  paging?: {
    total_items: number;
  };
}

interface FunnelData {
  [key: string]: Metric | undefined;
}


export interface SubOffice {
  id: number;
  name: string;
}

export interface Committee {
  suboffices: SubOffice[];
}

export interface MemberLead {
  id: string;
  lead_name: string;
  date_of_birth: string;
  email: string;
  status: string;
  academic_level: {
    name: string;
  };
  backgrounds: {
    constant_name: string;
  }[];
  country_code: string;
  phone: string;
  allow_phone_communication: boolean;
  created_at: string;
  home_lc: {
    name: string;
  };
}

export interface MemberLeadsResponse {
  data: MemberLead[];
  paging: {
    total_items: number;
    total_pages: number;
  };
}

export interface MemberLeadsData {
  data: {
    memberLeads: MemberLeadsResponse;
  };
}

export interface E2EAnalyticsFilters {
  sendingEntity: number;
  hostingEntity: number;
  status: string;
  date: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export interface PersonContactDetail {
  country_code: string;
  phone: string;
}

export interface Person {
  id: string;
  full_name: string;
  dob: string;
  email: string;
  contact_detail: PersonContactDetail;
  created_at: string;
  gender: string;
  home_lc: {
    name: string;
  };
  contacted_at: string | null;
}

export interface PeopleResponse {
  data: Person[];
  paging: {
    total_items: number;
    total_pages: number;
  };
}

export interface PeopleData {
  data: {
    people: PeopleResponse;
  };
}

export interface MonthlyData {
  month: string;
  ogx?: {
    data?: FunnelData;
  };
  icx?: {
    data?: FunnelData;
  };
}
