-- ==============================================================================
-- InSilicoVida: Auto-generate LinkedIn RSS Feed Trigger Function
-- Target Table: insilico.team_members
-- Column: links (JSONB)
-- ==============================================================================

-- 1. Create or replace the trigger function
CREATE OR REPLACE FUNCTION insilico.auto_generate_linkedin_rss()
RETURNS TRIGGER AS $$
DECLARE
    linkedin_url TEXT;
    clean_username TEXT;
    rss_link TEXT;
BEGIN
    -- Extract LinkedIn link from jsonb links column
    linkedin_url := NEW.links->>'LinkedIn';

    IF linkedin_url IS NOT NULL AND TRIM(linkedin_url) <> '' THEN
        -- Strip protocol, domain, and trailing query parameters
        clean_username := regexp_replace(
            regexp_replace(linkedin_url, '^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/', '', 'i'),
            '[\/?#].*$', ''
        );
        clean_username := TRIM(clean_username);

        -- If linkedinFeed is not yet set or empty, generate default RSS bridge URL
        IF (NEW.links->>'linkedinFeed') IS NULL OR TRIM(NEW.links->>'linkedinFeed') = '' THEN
            rss_link := 'https://rsshub.app/linkedin/post/' || clean_username;
            NEW.links := jsonb_set(
                COALESCE(NEW.links, '{}'::jsonb),
                '{linkedinFeed}',
                to_jsonb(rss_link)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Bind the trigger to insilico.team_members
DROP TRIGGER IF EXISTS trigger_auto_generate_linkedin_rss ON insilico.team_members;

CREATE TRIGGER trigger_auto_generate_linkedin_rss
BEFORE INSERT OR UPDATE ON insilico.team_members
FOR EACH ROW
EXECUTE FUNCTION insilico.auto_generate_linkedin_rss();

-- 3. One-time backfill for existing members with LinkedIn profiles
UPDATE insilico.team_members
SET links = jsonb_set(
    COALESCE(links, '{}'::jsonb),
    '{linkedinFeed}',
    to_jsonb('https://rsshub.app/linkedin/post/' || TRIM(regexp_replace(regexp_replace(links->>'LinkedIn', '^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/', '', 'i'), '[\/?#].*$', '')))
)
WHERE (links->>'LinkedIn') IS NOT NULL 
  AND TRIM(links->>'LinkedIn') <> ''
  AND ((links->>'linkedinFeed') IS NULL OR TRIM(links->>'linkedinFeed') = '');
