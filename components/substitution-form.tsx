"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { getTrainers, addSubstitution, getBalanceBetweenTrainers } from "@/app/actions"

export default function SubstitutionForm() {
  const [trainers, setTrainers] = useState([])
  const [absentTrainerId, setAbsentTrainerId] = useState("")
  const [substituteTrainerId, setSubstituteTrainerId] = useState("")
  const [date, setDate] = useState(new Date())
  const [notes, setNotes] = useState("")
  const [currentBalance, setCurrentBalance] = useState(0)
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

  useEffect(() => {
    async function fetchBalance() {
      if (absentTrainerId && substituteTrainerId) {
        try {
          const balance = await getBalanceBetweenTrainers(absentTrainerId, substituteTrainerId)
          setCurrentBalance(balance)
        } catch (error) {
          console.error("Failed to fetch balance:", error)
        }
      }
    }

    fetchBalance()
  }, [absentTrainerId, substituteTrainerId])

  const handleSubmit = async () => {
    if (!absentTrainerId || !substituteTrainerId || !date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (absentTrainerId === substituteTrainerId) {
      toast({
        title: "Invalid selection",
        description: "A trainer cannot substitute for themselves.",
        variant: "destructive",
      })
      return
    }

    try {
      await addSubstitution({
        absentTrainerId,
        substituteTrainerId,
        date: date.toISOString(),
        notes,
      })

      // Reset form
      setAbsentTrainerId("")
      setSubstituteTrainerId("")
      setDate(new Date())
      setNotes("")

      toast({
        title: "Substitution recorded",
        description: "The substitution has been successfully recorded.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record substitution",
        variant: "destructive",
      })
    }
  }

  const absentTrainer = trainers.find((t) => t._id === absentTrainerId)
  const substituteTrainer = trainers.find((t) => t._id === substituteTrainerId)

  let balanceMessage = ""
  if (absentTrainer && substituteTrainer) {
    if (currentBalance > 0) {
      balanceMessage = `${absentTrainer.name} already owes ${substituteTrainer.name} ${currentBalance} day(s)`
    } else if (currentBalance < 0) {
      balanceMessage = `${substituteTrainer.name} already owes ${absentTrainer.name} ${Math.abs(currentBalance)} day(s)`
    } else {
      balanceMessage = "These trainers are currently even (no days owed)"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record New Substitution</CardTitle>
        <CardDescription>Record when one trainer substitutes for another</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="absent-trainer">Absent Trainer</Label>
          <Select value={absentTrainerId} onValueChange={setAbsentTrainerId}>
            <SelectTrigger id="absent-trainer">
              <SelectValue placeholder="Select trainer who is absent" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading trainers...
                </SelectItem>
              ) : trainers.length === 0 ? (
                <SelectItem value="no-trainers" disabled>
                  No trainers available. Add trainers first.
                </SelectItem>
              ) : (
                trainers.map((trainer) => (
                  <SelectItem key={trainer._id} value={trainer._id}>
                    {trainer.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="substitute-trainer">Substitute Trainer</Label>
          <Select value={substituteTrainerId} onValueChange={setSubstituteTrainerId}>
            <SelectTrigger id="substitute-trainer">
              <SelectValue placeholder="Select trainer who is substituting" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading trainers...
                </SelectItem>
              ) : trainers.length === 0 ? (
                <SelectItem value="no-trainers" disabled>
                  No trainers available. Add trainers first.
                </SelectItem>
              ) : (
                trainers.map((trainer) => (
                  <SelectItem key={trainer._id} value={trainer._id} disabled={trainer._id === absentTrainerId}>
                    {trainer.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {absentTrainerId && substituteTrainerId && absentTrainerId !== substituteTrainerId && (
          <div className="text-sm font-medium">{balanceMessage}</div>
        )}

        <div className="space-y-2">
          <Label>Date of Substitution</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes about this substitution"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Record Substitution
        </Button>
      </CardFooter>
    </Card>
  )
}
