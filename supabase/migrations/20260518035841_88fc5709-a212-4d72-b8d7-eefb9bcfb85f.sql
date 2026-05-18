ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users subscribe to own channels" ON realtime.messages;
DROP POLICY IF EXISTS "Users broadcast to own channels" ON realtime.messages;

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
);

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
);