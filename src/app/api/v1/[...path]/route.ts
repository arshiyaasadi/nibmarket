import { createBffRouteHandlers } from "@/lib/api/server/bff-route-handler";

export const { GET, POST, PUT, PATCH, DELETE } = createBffRouteHandlers();
