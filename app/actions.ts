"use server"

import { revalidatePath } from "next/cache"
import connectToDatabase from "@/lib/mongodb"
import Trainer from "@/models/Trainer"
import Substitution from "@/models/Substitution"
import Balance from "@/models/Balance"
import mongoose from "mongoose"

// Trainer actions
export async function getTrainers() {
  await connectToDatabase()
  const trainers = await Trainer.find().sort({ name: 1 })
  return JSON.parse(JSON.stringify(trainers))
}

export async function addTrainer(name: string) {
  await connectToDatabase()
  const trainer = new Trainer({ name })
  await trainer.save()
  revalidatePath("/")
  return JSON.parse(JSON.stringify(trainer))
}

export async function updateTrainer(id: string, name: string) {
  await connectToDatabase()
  const trainer = await Trainer.findByIdAndUpdate(id, { name }, { new: true })
  revalidatePath("/")
  return JSON.parse(JSON.stringify(trainer))
}

export async function removeTrainer(id: string) {
  await connectToDatabase()
  
  try {
    // Delete the trainer
    const trainer = await Trainer.findById(id)
    console.log('trainer:', trainer)
    await Trainer.findByIdAndDelete(id)

    // Delete all substitutions involving this trainer
    await Substitution.deleteMany({
      $or: [{ absentTrainerId: id }, { substituteTrainerId: id }],
    })

    // Delete all balances involving this trainer
    await Balance.deleteMany({
      $or: [{ trainerId: id }, { owesToTrainerId: id }],
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    throw error
  }
}


// Substitution actions
export async function getSubstitutions() {
  await connectToDatabase()
  const substitutions = await Substitution.find()
    .populate("absentTrainerId", "name")
    .populate("substituteTrainerId", "name")
    .sort({ date: -1 })
  return JSON.parse(JSON.stringify(substitutions))
}

export async function addSubstitution(data: {
  absentTrainerId: string
  substituteTrainerId: string
  date: string
  notes?: string
}) {
  await connectToDatabase()

  try {
    // Create the substitution
    const substitution = new Substitution({
      absentTrainerId: data.absentTrainerId,
      substituteTrainerId: data.substituteTrainerId,
      date: new Date(data.date),
      notes: data.notes,
    })
    await substitution.save()

    // Update balances
    const { absentTrainerId, substituteTrainerId } = data

    // Check if there's an existing balance in either direction
    const existingBalance = await Balance.findOne({
      $or: [
        { trainerId: absentTrainerId, owesToTrainerId: substituteTrainerId },
        { trainerId: substituteTrainerId, owesToTrainerId: absentTrainerId },
      ],
    })

    if (existingBalance) {
      if (
        existingBalance.trainerId.toString() === absentTrainerId &&
        existingBalance.owesToTrainerId.toString() === substituteTrainerId
      ) {
        // Absent trainer already owes the substitute, increase the debt
        existingBalance.daysOwed += 1
        await existingBalance.save()
      } else {
        // Substitute owes the absent trainer, decrease the debt or flip it
        if (existingBalance.daysOwed > 1) {
          existingBalance.daysOwed -= 1
          await existingBalance.save()
        } else {
          // Remove the old balance as they're now even
          await Balance.findByIdAndDelete(existingBalance._id)
        }
      }
    } else {
      // Create new balance
      const newBalance = new Balance({
        trainerId: absentTrainerId,
        owesToTrainerId: substituteTrainerId,
        daysOwed: 1,
      })
      await newBalance.save()
    }

    revalidatePath("/")
    return JSON.parse(JSON.stringify(substitution))
  } catch (error) {
    throw error
  }
}


export async function removeSubstitution(id: string) {
  await connectToDatabase()

  try {
    // Find the substitution
    const substitution = await Substitution.findById(id)
    if (!substitution) {
      throw new Error("Substitution not found")
    }

    const { absentTrainerId, substituteTrainerId } = substitution

    // Delete the substitution
    await Substitution.findByIdAndDelete(id)

    // Update balances
    const existingBalance = await Balance.findOne({
      $or: [
        { trainerId: absentTrainerId, owesToTrainerId: substituteTrainerId },
        { trainerId: substituteTrainerId, owesToTrainerId: absentTrainerId },
      ],
    })

    if (existingBalance) {
      if (
        existingBalance.trainerId.toString() === absentTrainerId.toString() &&
        existingBalance.owesToTrainerId.toString() === substituteTrainerId.toString()
      ) {
        // Decrease the debt
        if (existingBalance.daysOwed > 1) {
          existingBalance.daysOwed -= 1
          await existingBalance.save()
        } else {
          // Remove the balance if it's down to 0
          await Balance.findByIdAndDelete(existingBalance._id)
        }
      } else {
        // Increase the debt in the opposite direction
        existingBalance.daysOwed += 1
        await existingBalance.save()
      }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    throw error
  }
}

// Balance actions
export async function getBalances() {
  await connectToDatabase()
  const balances = await Balance.find()
    .populate("trainerId", "name")
    .populate("owesToTrainerId", "name")
    .sort({ daysOwed: -1 })
  return JSON.parse(JSON.stringify(balances))
}

export async function getBalanceBetweenTrainers(trainer1Id: string, trainer2Id: string) {
  await connectToDatabase()

  const balance = await Balance.findOne({
    $or: [
      { trainerId: trainer1Id, owesToTrainerId: trainer2Id },
      { trainerId: trainer2Id, owesToTrainerId: trainer1Id },
    ],
  })

  if (!balance) return 0

  if (balance.trainerId.toString() === trainer1Id) {
    return balance.daysOwed
  } else {
    return -balance.daysOwed
  }
}
