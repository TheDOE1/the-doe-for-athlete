CREATE TYPE "public"."user_role" AS ENUM('admin', 'head_coach', 'coach', 'physio', 'athlete');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('field', 'gym', 'match', 'recovery');--> statement-breakpoint
CREATE TYPE "public"."acwr_zone" AS ENUM('green', 'orange', 'red');--> statement-breakpoint
CREATE TYPE "public"."injury_severity" AS ENUM('minor', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."protocol_type" AS ENUM('nordic', 'copenhagen', 'reverse_nordic');--> statement-breakpoint
CREATE TYPE "public"."cycle_type" AS ENUM('macrocycle', 'mesocycle');--> statement-breakpoint
CREATE TYPE "public"."microcycle_status" AS ENUM('planned', 'active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."exercise_category" AS ENUM('strength', 'plyometric', 'speed', 'agility', 'prevention', 'recovery');--> statement-breakpoint
CREATE TYPE "public"."fv_deficit" AS ENUM('force', 'velocity', 'balanced');--> statement-breakpoint
CREATE TYPE "public"."pap_target_quality" AS ENUM('power', 'speed', 'reactive_strength');--> statement-breakpoint
CREATE TYPE "public"."sport_specificity" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."player_sex" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."preseason_status" AS ENUM('draft', 'active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."cycle_phase" AS ENUM('follicular', 'ovulatory', 'luteal', 'menstrual');--> statement-breakpoint
CREATE TYPE "public"."reds_risk" AS ENUM('low', 'moderate', 'high');--> statement-breakpoint
CREATE TYPE "public"."embedding_status" AS ENUM('pending', 'done');--> statement-breakpoint
CREATE TYPE "public"."ai_message_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" timestamp,
	"token_type" varchar(255),
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"plan" varchar(50) DEFAULT 'free',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"position" varchar(50),
	"birth_date" timestamp,
	"sex" varchar(10),
	"height" varchar(10),
	"weight" varchar(10),
	"team_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" text NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sport" varchar(100) DEFAULT 'football',
	"season" varchar(20),
	"organization_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'coach' NOT NULL,
	"organization_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "wellness_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"date" date NOT NULL,
	"sleep" integer NOT NULL,
	"fatigue" integer NOT NULL,
	"soreness" integer NOT NULL,
	"stress" integer NOT NULL,
	"mood" integer NOT NULL,
	"hrv" real,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_loads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"rpe" integer NOT NULL,
	"duration_min" integer NOT NULL,
	"srpe" real NOT NULL,
	"hr_data" jsonb,
	"gps_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"type" "session_type" NOT NULL,
	"date" date NOT NULL,
	"duration" integer NOT NULL,
	"rpe_avg" real,
	"phase" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acwr_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"date" date NOT NULL,
	"acute_load" real NOT NULL,
	"chronic_load" real NOT NULL,
	"ratio" real NOT NULL,
	"zone" "acwr_zone" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "injury_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"location" varchar(100) NOT NULL,
	"mechanism" text,
	"severity" "injury_severity" NOT NULL,
	"start_date" date NOT NULL,
	"return_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prevention_protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"type" "protocol_type" NOT NULL,
	"exercises" jsonb NOT NULL,
	"frequency" integer NOT NULL,
	"compliance_rate" real DEFAULT 0,
	"start_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "microcycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"focus" varchar(255),
	"target_load" real,
	"actual_load" real,
	"status" "microcycle_status" DEFAULT 'planned' NOT NULL,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planning_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"type" "cycle_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"objective" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_microcycle_map" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"microcycle_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "exercise_category" NOT NULL,
	"muscle_groups" text[] DEFAULT '{}' NOT NULL,
	"equipment" text[] DEFAULT '{}' NOT NULL,
	"description" text NOT NULL,
	"video_url" text,
	"science_rationale" text NOT NULL,
	"difficulty" integer NOT NULL,
	"sport_specificity" "sport_specificity" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "force_velocity_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"date" date NOT NULL,
	"f0" real NOT NULL,
	"v0" real NOT NULL,
	"pmax" real NOT NULL,
	"sfv" real NOT NULL,
	"drf" real NOT NULL,
	"optimal_load" real,
	"deficit" "fv_deficit" NOT NULL,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pap_complexes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"heavy_exercise_id" uuid NOT NULL,
	"explosive_exercise_id" uuid NOT NULL,
	"rest_seconds" integer NOT NULL,
	"target_quality" "pap_target_quality" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preseason_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"phase_number" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"weeks_start" integer NOT NULL,
	"weeks_end" integer NOT NULL,
	"focus" text NOT NULL,
	"physiology_target" text NOT NULL,
	"conditioning_target" text NOT NULL,
	"key_metrics" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preseason_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"total_weeks" integer NOT NULL,
	"start_date" date NOT NULL,
	"player_sex" "player_sex" NOT NULL,
	"chronic_load_baseline" real NOT NULL,
	"hq_ratio" real NOT NULL,
	"status" "preseason_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "female_screenings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"date" date NOT NULL,
	"iron_level" real,
	"ferritin" real,
	"bone_density_score" real,
	"amenorrhea_months" integer DEFAULT 0,
	"energy_availability" real,
	"reds_risk" "reds_risk" DEFAULT 'low' NOT NULL,
	"block_high_impact" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menstrual_cycle_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"date" date NOT NULL,
	"phase" "cycle_phase" NOT NULL,
	"day_of_cycle" integer NOT NULL,
	"symptoms" jsonb,
	"training_adaptations" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"context" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "ai_message_role" NOT NULL,
	"content" text NOT NULL,
	"sources" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"authors" text[] NOT NULL,
	"journal" varchar(255) NOT NULL,
	"year" integer NOT NULL,
	"abstract" text NOT NULL,
	"doi" varchar(255),
	"url" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"embedding_status" "embedding_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_entries" ADD CONSTRAINT "wellness_entries_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_loads" ADD CONSTRAINT "session_loads_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_loads" ADD CONSTRAINT "session_loads_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acwr_records" ADD CONSTRAINT "acwr_records_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "injury_records" ADD CONSTRAINT "injury_records_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prevention_protocols" ADD CONSTRAINT "prevention_protocols_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "microcycles" ADD CONSTRAINT "microcycles_cycle_id_planning_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."planning_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planning_cycles" ADD CONSTRAINT "planning_cycles_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_microcycle_map" ADD CONSTRAINT "session_microcycle_map_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_microcycle_map" ADD CONSTRAINT "session_microcycle_map_microcycle_id_microcycles_id_fk" FOREIGN KEY ("microcycle_id") REFERENCES "public"."microcycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "force_velocity_profiles" ADD CONSTRAINT "force_velocity_profiles_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pap_complexes" ADD CONSTRAINT "pap_complexes_heavy_exercise_id_exercise_library_id_fk" FOREIGN KEY ("heavy_exercise_id") REFERENCES "public"."exercise_library"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pap_complexes" ADD CONSTRAINT "pap_complexes_explosive_exercise_id_exercise_library_id_fk" FOREIGN KEY ("explosive_exercise_id") REFERENCES "public"."exercise_library"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preseason_phases" ADD CONSTRAINT "preseason_phases_plan_id_preseason_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."preseason_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preseason_plans" ADD CONSTRAINT "preseason_plans_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "female_screenings" ADD CONSTRAINT "female_screenings_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menstrual_cycle_entries" ADD CONSTRAINT "menstrual_cycle_entries_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;