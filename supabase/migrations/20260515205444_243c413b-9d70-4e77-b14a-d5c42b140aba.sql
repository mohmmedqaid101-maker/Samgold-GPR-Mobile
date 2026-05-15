DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'realtime' AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users subscribe to own channels" ON realtime.messages';
    EXECUTE 'DROP POLICY IF EXISTS "Users broadcast to own channels" ON realtime.messages';
    EXECUTE $p$
      CREATE POLICY "Users subscribe to own channels"
      ON realtime.messages
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() IS NOT NULL
        AND (
          realtime.topic() = 'user:' || auth.uid()::text
          OR realtime.topic() LIKE 'user:' || auth.uid()::text || ':%'
        )
      )
    $p$;
    EXECUTE $p$
      CREATE POLICY "Users broadcast to own channels"
      ON realtime.messages
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND (
          realtime.topic() = 'user:' || auth.uid()::text
          OR realtime.topic() LIKE 'user:' || auth.uid()::text || ':%'
        )
      )
    $p$;
  END IF;
END $$;