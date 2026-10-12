import { CreateStepper } from '@/features/poster/components/CreateStepper';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomeFooter } from '@/features/home/components/HomeFooter';

export default function CreatePage() {
  return (
    <div
      className="flex min-h-screen flex-col bg-[#080f28] text-[#f7f3e8]"
      dir="rtl"
    >
      <HomeHeader variant="create" />
      <CreateStepper />
      <HomeFooter variant="create" />
    </div>
  );
}
