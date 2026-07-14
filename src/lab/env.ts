import type { Env } from "../contracts";

export interface LabEnv extends Env {
  LAB_REPOSITORY?: "memory" | "supabase";
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  LAB_STORE_RAW_IMAGES?: "true" | "false";
  RAW_IMAGE_RETENTION_HOURS?: string;
}
