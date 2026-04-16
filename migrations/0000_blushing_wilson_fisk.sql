CREATE TABLE "refresh_token" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"refresh_token" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"is_email_verified" boolean DEFAULT false,
	"address" text,
	"phone" varchar,
	"is_phone_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_name_idx" ON "user" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");