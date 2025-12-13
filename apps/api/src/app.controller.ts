import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { db, sql } from "@monorepo/db";
import { Public } from "./auth/decorators/public.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get("api")
  getApi(): { message: string; timestamp: string } {
    return this.appService.getApiInfo();
  }

  @Public()
  @Get("api/health")
  getHealth(): { status: string } {
    return { status: "ok" };
  }

  @Public()
  @Get("api/db-check")
  async checkDb(): Promise<{ connected: boolean; message: string }> {
    try {
      await db.execute(sql`SELECT 1`);
      return { connected: true, message: "Database connection successful" };
    } catch (error) {
      return {
        connected: false,
        message: `Database connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}
