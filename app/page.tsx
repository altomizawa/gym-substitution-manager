import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import TrainerManagement from "@/components/trainer-management"
import SubstitutionForm from "@/components/substitution-form"
import SubstitutionHistory from "@/components/substitution-history"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">KOR SUBSTITUIÇÕES</h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="new-sub">New Substitution</TabsTrigger>
          <TabsTrigger value="trainers">Trainers</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <Dashboard />
        </TabsContent>

        <TabsContent value="new-sub" className="mt-6">
          <SubstitutionForm />
        </TabsContent>

        <TabsContent value="trainers" className="mt-6">
          <TrainerManagement />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <SubstitutionHistory />
        </TabsContent>
      </Tabs>
    </main>
  )
}
