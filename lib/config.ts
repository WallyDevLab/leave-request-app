import { z } from "zod"

/**
 * Configuration management with validation
 * Following working agreement:
 * - Never hardcode secrets
 * - Validate required secrets at startup
 * - Fail fast with clear messages
 */

const ConfigSchema = z.object({
  // Application
  nodeEnv: z.enum(["development", "production", "test"]).default("development"),
  appUrl: z.string().url().default("http://localhost:3000"),

  // Email service (optional in development)
  resendApiKey: z.string().optional(),
  sendgridApiKey: z.string().optional(),

  // Database (for future production use)
  databaseUrl: z.string().optional(),

  // Security
  jwtSecret: z.string().optional(),
  sessionSecret: z.string().optional(),
})

type Config = z.infer<typeof ConfigSchema>

/**
 * Load and validate configuration from environment variables
 */
function loadConfig(): Config {
  const rawConfig = {
    nodeEnv: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
  }

  try {
    return ConfigSchema.parse(rawConfig)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join(".")).join(", ")
      throw new Error(`Configuration validation failed. Missing or invalid: ${missingVars}`)
    }
    throw error
  }
}

/**
 * Validate required configuration for production
 */
export function validateProductionConfig(config: Config): void {
  if (config.nodeEnv === "production") {
    const required: (keyof Config)[] = ["resendApiKey", "databaseUrl", "jwtSecret", "sessionSecret"]

    const missing = required.filter((key) => !config[key])

    if (missing.length > 0) {
      throw new Error(
        `Production deployment requires the following environment variables: ${missing.join(", ")}`
      )
    }
  }
}

// Export singleton config instance
export const config = loadConfig()

// Validate production requirements if in production
if (typeof window === "undefined") {
  // Server side only
  try {
    validateProductionConfig(config)
  } catch (error) {
    if (config.nodeEnv === "production") {
      // In production, fail hard
      throw error
    } else {
      // In development, just warn
      console.warn("Configuration warning:", error instanceof Error ? error.message : String(error))
    }
  }
}

export default config
