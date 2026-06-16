import { api } from "./client";

export type ApplicationRequest = {
  email: string;
  name: string;
  nickname: string;
  studentId: string;
  department: string;
  schoolYear: string;
  applyFields: string[];
  teamExperience: string;
  programmingMotivation: string;
  applyPurpose: string;
  devLinks: string;
  howFound: string;
  otAttendance: string;
  welcomePartyAttendance: string;
};

export const applyApi = {
  submit: (data: ApplicationRequest) => api.post("/application", data),
  check: (studentId: string, email: string) =>
    api.get("/application/check", { params: { studentId, email } }),
};
