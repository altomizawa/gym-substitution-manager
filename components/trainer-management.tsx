"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, X, Check } from "lucide-react"
import { getTrainers, addTrainer, updateTrainer, removeTrainer } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export default function TrainerManagement() {
  const [trainers, setTrainers] = useState([])
  const [newTrainerName, setNewTrainerName] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTrainers() {
      try {
        const data = await getTrainers()
        setTrainers(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load trainers",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrainers()
  }, [])

  const handleAddTrainer = async () => {
    if (newTrainerName.trim()) {
      try {
        const trainer = await addTrainer(newTrainerName.trim())
        setTrainers([...trainers, trainer])
        setNewTrainerName("")
        toast({
          title: "Success",
          description: "Trainer added successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add trainer",
          variant: "destructive",
        })
      }
    }
  }

  const startEditing = (trainer) => {
    setEditingId(trainer._id)
    setEditName(trainer.name)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditName("")
  }

  const saveEdit = async (id) => {
    if (editName.trim()) {
      try {
        const updatedTrainer = await updateTrainer(id, editName.trim())
        setTrainers(trainers.map((trainer) => (trainer._id === id ? updatedTrainer : trainer)))
        setEditingId(null)
        setEditName("")
        toast({
          title: "Success",
          description: "Trainer updated successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update trainer",
          variant: "destructive",
        })
      }
    }
  }

  const handleRemoveTrainer = async (id) => {
    try {
      await removeTrainer(id)
      setTrainers(trainers.filter((trainer) => trainer._id !== id))
      toast({
        title: "Success",
        description: "Trainer removed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove trainer",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainer Management</CardTitle>
        <CardDescription>Add, edit, or remove trainers from your gym</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="New trainer name"
            value={newTrainerName}
            onChange={(e) => setNewTrainerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTrainer()}
          />
          <Button onClick={handleAddTrainer}>
            <Plus className="mr-2 h-4 w-4" /> Add Trainer
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Loading trainers...
                </TableCell>
              </TableRow>
            ) : trainers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No trainers added yet. Add your first trainer above.
                </TableCell>
              </TableRow>
            ) : (
              trainers.map((trainer) => (
                <TableRow key={trainer._id}>
                  <TableCell>
                    {editingId === trainer._id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(trainer._id)}
                        autoFocus
                      />
                    ) : (
                      trainer.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === trainer._id ? (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => saveEdit(trainer._id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={cancelEditing}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEditing(trainer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleRemoveTrainer(trainer._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
