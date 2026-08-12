import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments } = await supabase.from("instruments").select();
  const {
  data: { user },
  } = await supabase.auth.getUser();
  const { data, error, status, statusText } = await supabase
  .from("instruments")
  .select("*");

console.log({
  data,
  error,
  status,
  statusText,
});
  //console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
  //console.log("user", user);
  console.log("instruments", instruments);
  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}