"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getSubstitutions, removeSubstitution } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export default function SubstitutionHistory() {
  const [substitutions, setSubstitutions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [substitutionToDelete, setSubstitutionToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSubstitutions() {
      try {
        const data = await getSubstitutions()
        setSubstitutions(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load substitution history",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubstitutions()
  }, [])

  // Filter substitutions based on search term
  const filteredSubstitutions = substitutions.filter((sub) => {
    const absentTrainer = sub.absentTrainerId?.name || ""
    const substituteTrainer = sub.substituteTrainerId?.name || ""
    const searchLower = searchTerm.toLowerCase()
    const date = format(new Date(sub.date), "PPP")

    return (
      absentTrainer.toLowerCase().includes(searchLower) ||
      substituteTrainer.toLowerCase().includes(searchLower) ||
      date.toLowerCase().includes(searchLower) ||
      (sub.notes && sub.notes.toLowerCase().includes(searchLower))
    )
  })

  const confirmDelete = (id) => {
    setSubstitutionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (substitutionToDelete) {
      try {
        await removeSubstitution(substitutionToDelete)
        setSubstitutions(substitutions.filter((sub) => sub._id !== substitutionToDelete))
        setDeleteDialogOpen(false)
        setSubstitutionToDelete(null)
        toast({
          title: "Success",
          description: "Substitution removed successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove substitution",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Substitution History</CardTitle>
        <CardDescription>View and manage all recorded substitutions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search by trainer name, date, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading substitutions...</div>
        ) : substitutions.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No substitutions recorded</AlertTitle>
            <AlertDescription>When you record substitutions, they will appear here.</AlertDescription>
          </Alert>
        ) : filteredSubstitutions.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No results found</AlertTitle>
            <AlertDescription>No substitutions match your search criteria.</AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Absent Trainer</TableHead>
                <TableHead>Substitute Trainer</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubstitutions.map((sub) => (
                <TableRow key={sub._id}>
                  <TableCell>{format(new Date(sub.date), "PPP")}</TableCell>
                  <TableCell>{sub.absentTrainerId?.name || "Unknown"}</TableCell>
                  <TableCell>{sub.substituteTrainerId?.name || "Unknown"}</TableCell>
                  <TableCell>{sub.notes || "-"}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => confirmDelete(sub._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this substitution record? This will also update the balance between the
                trainers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
