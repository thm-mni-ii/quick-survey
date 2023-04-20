--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: parse
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO parse;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: parse
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO parse;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: parse
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO parse;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: parse
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: array_add(jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: parse
--

CREATE FUNCTION public.array_add("array" jsonb, "values" jsonb) RETURNS jsonb
    LANGUAGE sql IMMUTABLE STRICT
    AS $$ SELECT array_to_json(ARRAY(SELECT unnest(ARRAY(SELECT DISTINCT jsonb_array_elements("array")) || ARRAY(SELECT jsonb_array_elements("values")))))::jsonb; $$;


ALTER FUNCTION public.array_add("array" jsonb, "values" jsonb) OWNER TO parse;

--
-- Name: array_add_unique(jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: parse
--

CREATE FUNCTION public.array_add_unique("array" jsonb, "values" jsonb) RETURNS jsonb
    LANGUAGE sql IMMUTABLE STRICT
    AS $$ SELECT array_to_json(ARRAY(SELECT DISTINCT unnest(ARRAY(SELECT DISTINCT jsonb_array_elements("array")) || ARRAY(SELECT DISTINCT jsonb_array_elements("values")))))::jsonb; $$;


ALTER FUNCTION public.array_add_unique("array" jsonb, "values" jsonb) OWNER TO parse;

--
-- Name: array_contains(jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: parse
--

CREATE FUNCTION public.array_contains("array" jsonb, "values" jsonb) RETURNS boolean
    LANGUAGE sql IMMUTABLE STRICT
    AS $$ SELECT RES.CNT >= 1 FROM (SELECT COUNT(*) as CNT FROM jsonb_array_elements("array") as elt WHERE elt IN (SELECT jsonb_array_elements("values"))) as RES; $$;


ALTER FUNCTION public.array_contains("array" jsonb, "values" jsonb) OWNER TO parse;

--
-- Name: array_contains_all(jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: parse
--

CREATE FUNCTION public.array_contains_all("array" jsonb, "values" jsonb) RETURNS boolean
    LANGUAGE sql IMMUTABLE STRICT
    AS $$ SELECT CASE WHEN 0 = jsonb_array_length("values") THEN true = false ELSE (SELECT RES.CNT = jsonb_array_length("values") FROM (SELECT COUNT(*) as CNT FROM jsonb_array_elements_text("array") as elt WHERE elt IN (SELECT jsonb_array_elements_text("values"))) as RES) END; $$;


ALTER FUNCTION public.array_contains_all("array" jsonb, "values" jsonb) OWNER TO parse;

--
-- Name: array_contains_all_regex(jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: parse
--

CREATE FUNCTION public.array_contains_all_regex("array" jsonb, "values" jsonb) RETURNS boolean
    LANGUAGE sql IMMUTABLE STRICT
    AS $$ SELECT CASE WHEN 0 = jsonb_array_length("values") THEN true = false ELSE (SELECT RES.CNT = jsonb_array_length("values") FROM (SELECT COUNT(*) as CNT FROM jsonb_array_elements_text("array") as elt WHERE elt LIKE ANY (SELECT jsonb_array_elements_text("values"))) as RES) END; $$;


ALTER FUNCTION public.array_contains_all_regex("array" jsonb, "values" jsonb) OWNER TO parse;

--
-- Name: array_remove(jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: parse
--

CREATE FUNCTION public.array_remove("array" jsonb, "values" jsonb) RETURNS jsonb
    LANGUAGE sql IMMUTABLE STRICT
    AS $$ SELECT array_to_json(ARRAY(SELECT * FROM jsonb_array_elements("array") as elt WHERE elt NOT IN (SELECT * FROM (SELECT jsonb_array_elements("values")) AS sub)))::jsonb; $$;


ALTER FUNCTION public.array_remove("array" jsonb, "values" jsonb) OWNER TO parse;

--
-- Name: idempotency_delete_expired_records(); Type: FUNCTION; Schema: public; Owner: parse
--

CREATE FUNCTION public.idempotency_delete_expired_records() RETURNS void
    LANGUAGE plpgsql
    AS $$ BEGIN DELETE FROM "_Idempotency" WHERE expire < NOW() - INTERVAL '300 seconds'; END; $$;


ALTER FUNCTION public.idempotency_delete_expired_records() OWNER TO parse;

--
-- Name: json_object_set_key(jsonb, text, anyelement); Type: FUNCTION; Schema: public; Owner: parse
--

CREATE FUNCTION public.json_object_set_key(json jsonb, key_to_set text, value_to_set anyelement) RETURNS jsonb
    LANGUAGE sql IMMUTABLE STRICT
    AS $$ SELECT concat('{', string_agg(to_json("key") || ':' || "value", ','), '}')::jsonb FROM (SELECT * FROM jsonb_each("json") WHERE key <> key_to_set UNION ALL SELECT key_to_set, to_json("value_to_set")::jsonb) AS fields $$;


ALTER FUNCTION public.json_object_set_key(json jsonb, key_to_set text, value_to_set anyelement) OWNER TO parse;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Answer; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."Answer" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    _rperm text[],
    _wperm text[],
    answer jsonb,
    participant text,
    question text,
    "time" double precision
);


ALTER TABLE public."Answer" OWNER TO parse;

--
-- Name: Participant; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."Participant" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    _rperm text[],
    _wperm text[],
    identifier text
);


ALTER TABLE public."Participant" OWNER TO parse;

--
-- Name: Question; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."Question" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    _rperm text[],
    _wperm text[],
    description text,
    type text,
    options jsonb,
    title text,
    survey text,
    page double precision,
    required boolean,
    "timeLimit" double precision,
    "position" double precision
);


ALTER TABLE public."Question" OWNER TO parse;

--
-- Name: Survey; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."Survey" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    _rperm text[],
    _wperm text[],
    name text,
    description text,
    "activeFrom" timestamp with time zone,
    "activeTo" timestamp with time zone,
    creator text
);


ALTER TABLE public."Survey" OWNER TO parse;

--
-- Name: _Audience; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_Audience" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    name text,
    query text,
    "lastUsed" timestamp with time zone,
    "timesUsed" double precision,
    _rperm text[],
    _wperm text[]
);


ALTER TABLE public."_Audience" OWNER TO parse;

--
-- Name: _GlobalConfig; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_GlobalConfig" (
    "objectId" text NOT NULL,
    params jsonb,
    "masterKeyOnly" jsonb
);


ALTER TABLE public."_GlobalConfig" OWNER TO parse;

--
-- Name: _GraphQLConfig; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_GraphQLConfig" (
    "objectId" text NOT NULL,
    config jsonb
);


ALTER TABLE public."_GraphQLConfig" OWNER TO parse;

--
-- Name: _Hooks; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_Hooks" (
    "functionName" text,
    "className" text,
    "triggerName" text,
    url text
);


ALTER TABLE public."_Hooks" OWNER TO parse;

--
-- Name: _Idempotency; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_Idempotency" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "reqId" text,
    expire timestamp with time zone,
    _rperm text[],
    _wperm text[]
);


ALTER TABLE public."_Idempotency" OWNER TO parse;

--
-- Name: _JobSchedule; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_JobSchedule" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "jobName" text,
    description text,
    params text,
    "startAfter" text,
    "daysOfWeek" jsonb,
    "timeOfDay" text,
    "lastRun" double precision,
    "repeatMinutes" double precision,
    _rperm text[],
    _wperm text[]
);


ALTER TABLE public."_JobSchedule" OWNER TO parse;

--
-- Name: _JobStatus; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_JobStatus" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "jobName" text,
    source text,
    status text,
    message text,
    params jsonb,
    "finishedAt" timestamp with time zone,
    _rperm text[],
    _wperm text[]
);


ALTER TABLE public."_JobStatus" OWNER TO parse;

--
-- Name: _Join:roles:_Role; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_Join:roles:_Role" (
    "relatedId" character varying(120) NOT NULL,
    "owningId" character varying(120) NOT NULL
);


ALTER TABLE public."_Join:roles:_Role" OWNER TO parse;

--
-- Name: _Join:users:_Role; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_Join:users:_Role" (
    "relatedId" character varying(120) NOT NULL,
    "owningId" character varying(120) NOT NULL
);


ALTER TABLE public."_Join:users:_Role" OWNER TO parse;

--
-- Name: _PushStatus; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_PushStatus" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "pushTime" text,
    source text,
    query text,
    payload text,
    title text,
    expiry double precision,
    expiration_interval double precision,
    status text,
    "numSent" double precision,
    "numFailed" double precision,
    "pushHash" text,
    "errorMessage" jsonb,
    "sentPerType" jsonb,
    "failedPerType" jsonb,
    "sentPerUTCOffset" jsonb,
    "failedPerUTCOffset" jsonb,
    count double precision,
    _rperm text[],
    _wperm text[]
);


ALTER TABLE public."_PushStatus" OWNER TO parse;

--
-- Name: _Role; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_Role" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    name text,
    _rperm text[],
    _wperm text[]
);


ALTER TABLE public."_Role" OWNER TO parse;

--
-- Name: _SCHEMA; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_SCHEMA" (
    "className" character varying(120) NOT NULL,
    schema jsonb,
    "isParseClass" boolean
);


ALTER TABLE public."_SCHEMA" OWNER TO parse;

--
-- Name: _Session; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_Session" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "user" text,
    "installationId" text,
    "sessionToken" text,
    "expiresAt" timestamp with time zone,
    "createdWith" jsonb,
    _rperm text[],
    _wperm text[]
);


ALTER TABLE public."_Session" OWNER TO parse;

--
-- Name: _User; Type: TABLE; Schema: public; Owner: parse
--

CREATE TABLE public."_User" (
    "objectId" text NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    username text,
    email text,
    "emailVerified" boolean,
    "authData" jsonb,
    _rperm text[],
    _wperm text[],
    _hashed_password text,
    _email_verify_token_expires_at timestamp with time zone,
    _email_verify_token text,
    _account_lockout_expires_at timestamp with time zone,
    _failed_login_count double precision,
    _perishable_token text,
    _perishable_token_expires_at timestamp with time zone,
    _password_changed_at timestamp with time zone,
    _password_history jsonb
);


ALTER TABLE public."_User" OWNER TO parse;

--
-- Data for Name: _SCHEMA; Type: TABLE DATA; Schema: public; Owner: parse
--

COPY public."_SCHEMA" ("className", schema, "isParseClass") FROM stdin;
Answer	{"fields": {"ACL": {"type": "ACL"}, "time": {"type": "Number", "required": false}, "answer": {"type": "Object", "required": true}, "objectId": {"type": "String"}, "question": {"type": "Pointer", "required": true, "targetClass": "Question"}, "createdAt": {"type": "Date"}, "updatedAt": {"type": "Date"}, "participant": {"type": "Pointer", "required": true, "targetClass": "Participant"}}, "className": "Answer", "classLevelPermissions": {"get": {"requiresAuthentication": true}, "find": {"requiresAuthentication": true}, "count": {"requiresAuthentication": true}, "create": {"*": true, "requiresAuthentication": true}, "delete": {"*": true, "requiresAuthentication": true}, "update": {"*": true, "requiresAuthentication": true}, "addField": {}, "protectedFields": {"*": []}}}	t
_User	{"fields": {"email": {"type": "String"}, "_rperm": {"type": "Array", "contents": {"type": "String"}}, "_wperm": {"type": "Array", "contents": {"type": "String"}}, "authData": {"type": "Object"}, "objectId": {"type": "String"}, "username": {"type": "String"}, "createdAt": {"type": "Date"}, "updatedAt": {"type": "Date"}, "emailVerified": {"type": "Boolean"}, "_hashed_password": {"type": "String"}}, "className": "_User", "classLevelPermissions": {"get": {"requiresAuthentication": true}, "find": {"requiresAuthentication": true}, "count": {"requiresAuthentication": true}, "create": {"requiresAuthentication": true}, "delete": {"requiresAuthentication": true}, "update": {"requiresAuthentication": true}, "addField": {}, "protectedFields": {"*": []}}}	t
Question	{"fields": {"ACL": {"type": "ACL"}, "page": {"type": "Number", "required": true, "defaultValue": 1}, "type": {"type": "String", "required": true}, "title": {"type": "String", "required": true}, "survey": {"type": "Pointer", "required": true, "targetClass": "Survey"}, "options": {"type": "Object", "required": false}, "objectId": {"type": "String"}, "position": {"type": "Number", "required": true}, "required": {"type": "Boolean", "required": true, "defaultValue": false}, "createdAt": {"type": "Date"}, "timeLimit": {"type": "Number", "required": false}, "updatedAt": {"type": "Date"}, "description": {"type": "String", "required": false}}, "className": "Question", "classLevelPermissions": {"get": {"*": true, "requiresAuthentication": true}, "find": {"*": true, "requiresAuthentication": true}, "count": {"*": true, "requiresAuthentication": true}, "create": {"requiresAuthentication": true}, "delete": {"requiresAuthentication": true}, "update": {"requiresAuthentication": true}, "addField": {}, "protectedFields": {"*": []}}}	t
_Session	{"fields": {"user": {"type": "Pointer", "targetClass": "_User"}, "_rperm": {"type": "Array", "contents": {"type": "String"}}, "_wperm": {"type": "Array", "contents": {"type": "String"}}, "objectId": {"type": "String"}, "createdAt": {"type": "Date"}, "expiresAt": {"type": "Date"}, "updatedAt": {"type": "Date"}, "createdWith": {"type": "Object"}, "sessionToken": {"type": "String"}, "installationId": {"type": "String"}}, "className": "_Session", "classLevelPermissions": {"get": {}, "find": {}, "count": {}, "create": {}, "delete": {}, "update": {}, "addField": {}, "protectedFields": {"*": []}}}	t
_Role	{"fields": {"name": {"type": "String"}, "roles": {"type": "Relation", "targetClass": "_Role"}, "users": {"type": "Relation", "targetClass": "_User"}, "_rperm": {"type": "Array", "contents": {"type": "String"}}, "_wperm": {"type": "Array", "contents": {"type": "String"}}, "objectId": {"type": "String"}, "createdAt": {"type": "Date"}, "updatedAt": {"type": "Date"}}, "className": "_Role", "classLevelPermissions": {"get": {"requiresAuthentication": true}, "find": {"requiresAuthentication": true}, "count": {"requiresAuthentication": true}, "create": {}, "delete": {}, "update": {}, "addField": {}, "protectedFields": {"*": []}}}	t
Participant	{"fields": {"ACL": {"type": "ACL"}, "objectId": {"type": "String"}, "createdAt": {"type": "Date"}, "updatedAt": {"type": "Date"}, "identifier": {"type": "String", "required": true}}, "className": "Participant", "classLevelPermissions": {"get": {"requiresAuthentication": true}, "find": {"requiresAuthentication": true}, "count": {"requiresAuthentication": true}, "create": {"*": true, "requiresAuthentication": true}, "delete": {"*": true, "requiresAuthentication": true}, "update": {"*": true, "requiresAuthentication": true}, "addField": {}, "protectedFields": {"*": []}}}	t
Survey	{"fields": {"name": {"type": "String", "required": true}, "_rperm": {"type": "Array", "contents": {"type": "String"}}, "_wperm": {"type": "Array", "contents": {"type": "String"}}, "creator": {"type": "Pointer", "required": true, "targetClass": "_User"}, "activeTo": {"type": "Date", "required": false}, "objectId": {"type": "String"}, "createdAt": {"type": "Date"}, "updatedAt": {"type": "Date"}, "activeFrom": {"type": "Date", "required": false}, "description": {"type": "String", "required": false}}, "className": "Survey", "classLevelPermissions": {"get": {"*": true, "requiresAuthentication": true}, "find": {"*": true, "requiresAuthentication": true}, "count": {"*": true, "requiresAuthentication": true}, "create": {"requiresAuthentication": true}, "delete": {"requiresAuthentication": true}, "update": {"requiresAuthentication": true}, "addField": {}, "protectedFields": {"*": []}}}	t
\.

--
-- Name: Answer Answer_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."Answer"
    ADD CONSTRAINT "Answer_pkey" PRIMARY KEY ("objectId");


--
-- Name: Participant Participant_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."Participant"
    ADD CONSTRAINT "Participant_pkey" PRIMARY KEY ("objectId");


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("objectId");


--
-- Name: Survey Survey_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."Survey"
    ADD CONSTRAINT "Survey_pkey" PRIMARY KEY ("objectId");


--
-- Name: _Audience _Audience_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_Audience"
    ADD CONSTRAINT "_Audience_pkey" PRIMARY KEY ("objectId");


--
-- Name: _GlobalConfig _GlobalConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_GlobalConfig"
    ADD CONSTRAINT "_GlobalConfig_pkey" PRIMARY KEY ("objectId");


--
-- Name: _GraphQLConfig _GraphQLConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_GraphQLConfig"
    ADD CONSTRAINT "_GraphQLConfig_pkey" PRIMARY KEY ("objectId");


--
-- Name: _Idempotency _Idempotency_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_Idempotency"
    ADD CONSTRAINT "_Idempotency_pkey" PRIMARY KEY ("objectId");


--
-- Name: _JobSchedule _JobSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_JobSchedule"
    ADD CONSTRAINT "_JobSchedule_pkey" PRIMARY KEY ("objectId");


--
-- Name: _JobStatus _JobStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_JobStatus"
    ADD CONSTRAINT "_JobStatus_pkey" PRIMARY KEY ("objectId");


--
-- Name: _Join:roles:_Role _Join:roles:_Role_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_Join:roles:_Role"
    ADD CONSTRAINT "_Join:roles:_Role_pkey" PRIMARY KEY ("relatedId", "owningId");


--
-- Name: _Join:users:_Role _Join:users:_Role_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_Join:users:_Role"
    ADD CONSTRAINT "_Join:users:_Role_pkey" PRIMARY KEY ("relatedId", "owningId");


--
-- Name: _PushStatus _PushStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_PushStatus"
    ADD CONSTRAINT "_PushStatus_pkey" PRIMARY KEY ("objectId");


--
-- Name: _Role _Role_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_Role"
    ADD CONSTRAINT "_Role_pkey" PRIMARY KEY ("objectId");


--
-- Name: _SCHEMA _SCHEMA_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_SCHEMA"
    ADD CONSTRAINT "_SCHEMA_pkey" PRIMARY KEY ("className");


--
-- Name: _Session _Session_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_Session"
    ADD CONSTRAINT "_Session_pkey" PRIMARY KEY ("objectId");


--
-- Name: _User _User_pkey; Type: CONSTRAINT; Schema: public; Owner: parse
--

ALTER TABLE ONLY public."_User"
    ADD CONSTRAINT "_User_pkey" PRIMARY KEY ("objectId");


--
-- Name: _Idempotency_unique_reqId; Type: INDEX; Schema: public; Owner: parse
--

CREATE UNIQUE INDEX "_Idempotency_unique_reqId" ON public."_Idempotency" USING btree ("reqId");


--
-- Name: _Role_unique_name; Type: INDEX; Schema: public; Owner: parse
--

CREATE UNIQUE INDEX "_Role_unique_name" ON public."_Role" USING btree (name);


--
-- Name: _User_unique_email; Type: INDEX; Schema: public; Owner: parse
--

CREATE UNIQUE INDEX "_User_unique_email" ON public."_User" USING btree (email);


--
-- Name: _User_unique_username; Type: INDEX; Schema: public; Owner: parse
--

CREATE UNIQUE INDEX "_User_unique_username" ON public."_User" USING btree (username);


--
-- Name: case_insensitive_email; Type: INDEX; Schema: public; Owner: parse
--

CREATE INDEX case_insensitive_email ON public."_User" USING btree (lower(email) varchar_pattern_ops);


--
-- Name: case_insensitive_username; Type: INDEX; Schema: public; Owner: parse
--

CREATE INDEX case_insensitive_username ON public."_User" USING btree (lower(username) varchar_pattern_ops);


--
-- Name: ttl; Type: INDEX; Schema: public; Owner: parse
--

CREATE INDEX ttl ON public."_Idempotency" USING btree (expire);


--
-- PostgreSQL database dump complete
--

