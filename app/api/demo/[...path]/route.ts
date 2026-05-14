import { handleDemoApiRequest } from "@/lib/demo/mockApi";

type DemoRouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function resolvePathSegments(context: DemoRouteContext) {
  const params = await context.params;
  return params.path ?? [];
}

async function handle(request: Request, context: DemoRouteContext) {
  return handleDemoApiRequest(request, await resolvePathSegments(context));
}

export async function GET(request: Request, context: DemoRouteContext) {
  return handle(request, context);
}

export async function POST(request: Request, context: DemoRouteContext) {
  return handle(request, context);
}

export async function PUT(request: Request, context: DemoRouteContext) {
  return handle(request, context);
}

export async function PATCH(request: Request, context: DemoRouteContext) {
  return handle(request, context);
}

export async function DELETE(request: Request, context: DemoRouteContext) {
  return handle(request, context);
}
