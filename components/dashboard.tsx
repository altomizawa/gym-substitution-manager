"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { getTrainers, getSubstitutions, getBalances } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const [trainers, setTrainers] = useState([])
  const [substitutions, setSubstitutions] = useState([])
  const [balances, setBalances] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [trainersData, substitutionsData, balancesData] = await Promise.all([
          getTrainers(),
          getSubstitutions(),
          getBalances(),
        ])

        setTrainers(trainersData)
        setSubstitutions(substitutionsData)
        setBalances(balancesData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : trainers.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading..."
                : trainers.length === 0
                  ? "No trainers added yet"
                  : trainers.length === 1
                    ? "1 trainer in the system"
                    : `${trainers.length} trainers in the system`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Substitutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : substitutions.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading..."
                : substitutions.length === 0
                  ? "No substitutions recorded yet"
                  : substitutions.length === 1
                    ? "1 substitution recorded"
                    : `${substitutions.length} substitutions recorded`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : balances.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading..."
                : balances.length === 0
                  ? "No outstanding balances"
                  : balances.length === 1
                    ? "1 active balance between trainers"
                    : `${balances.length} active balances between trainers`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Balances</CardTitle>
          <CardDescription>Who owes days to whom</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading balances...</div>
          ) : balances.length === 0 ? (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No balances yet</AlertTitle>
              <AlertDescription>
                When trainers substitute for each other, their balances will appear here. If trainers have substituted
                for each other equally, they won't appear here.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Owes</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => (
                  <TableRow key={balance._id}>
                    <TableCell className="font-medium">{balance.trainerId.name}</TableCell>
                    <TableCell>owes</TableCell>
                    <TableCell>{balance.owesToTrainerId.name}</TableCell>
                    <TableCell className="text-right">
                      {balance.daysOwed} day{balance.daysOwed !== 1 ? "s" : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
