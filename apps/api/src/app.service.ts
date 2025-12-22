import { Injectable } from "@nestjs/common";
import { greet } from "@monorepo/shared";

@Injectable()
export class AppService {
  getHello(): string {
    return greet("! Update the greet function to return a string");
  }

  getApiInfo(): { message: string; timestamp: string } {
    return {
      message: "Welcome to the API",
      timestamp: new Date().toISOString(),
    };
  }
}
