import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const t = await getTranslations("HomePage");

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>
            {t.rich("description", {
              path: (chunks) => (
                <code className="text-foreground">{chunks}</code>
              ),
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">{t("cta")}</Button>
        </CardContent>
      </Card>
    </main>
  );
}
