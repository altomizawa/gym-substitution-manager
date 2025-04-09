import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Trainer {
  id: string
  name: string
}

export interface Substitution {
  id: string
  date: string
  absentTrainerId: string
  substituteTrainerId: string
  notes?: string
  createdAt: string
}

export interface Balance {
  trainerId: string
  owesToTrainerId: string
  daysOwed: number
}

interface StoreState {
  trainers: Trainer[]
  substitutions: Substitution[]
  balances: Balance[]
  addTrainer: (name: string) => void
  removeTrainer: (id: string) => void
  updateTrainer: (id: string, name: string) => void
  addSubstitution: (substitution: Omit<Substitution, "id" | "createdAt">) => void
  removeSubstitution: (id: string) => void
  getTrainerById: (id: string) => Trainer | undefined
  getBalancesBetweenTrainers: (trainer1Id: string, trainer2Id: string) => number
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      trainers: [],
      substitutions: [],
      balances: [],

      addTrainer: (name: string) => {
        const id = crypto.randomUUID()
        set((state) => ({
          trainers: [...state.trainers, { id, name }],
        }))
      },

      removeTrainer: (id: string) => {
        set((state) => ({
          trainers: state.trainers.filter((trainer) => trainer.id !== id),
          // Remove any substitutions involving this trainer
          substitutions: state.substitutions.filter(
            (sub) => sub.absentTrainerId !== id && sub.substituteTrainerId !== id,
          ),
          // Remove any balances involving this trainer
          balances: state.balances.filter((balance) => balance.trainerId !== id && balance.owesToTrainerId !== id),
        }))
      },

      updateTrainer: (id: string, name: string) => {
        set((state) => ({
          trainers: state.trainers.map((trainer) => (trainer.id === id ? { ...trainer, name } : trainer)),
        }))
      },

      addSubstitution: (substitution) => {
        const { absentTrainerId, substituteTrainerId } = substitution
        const id = crypto.randomUUID()
        const createdAt = new Date().toISOString()

        // Add the substitution
        set((state) => ({
          substitutions: [...state.substitutions, { ...substitution, id, createdAt }],
        }))

        // Update balances
        set((state) => {
          // Find existing balance between these trainers
          const existingBalance = state.balances.find(
            (balance) =>
              (balance.trainerId === absentTrainerId && balance.owesToTrainerId === substituteTrainerId) ||
              (balance.trainerId === substituteTrainerId && balance.owesToTrainerId === absentTrainerId),
          )

          if (existingBalance) {
            // Update existing balance
            if (
              existingBalance.trainerId === absentTrainerId &&
              existingBalance.owesToTrainerId === substituteTrainerId
            ) {
              // Absent trainer already owes the substitute, increase the debt
              return {
                balances: state.balances.map((balance) =>
                  balance.trainerId === absentTrainerId && balance.owesToTrainerId === substituteTrainerId
                    ? { ...balance, daysOwed: balance.daysOwed + 1 }
                    : balance,
                ),
              }
            } else {
              // Substitute owes the absent trainer, decrease the debt or flip it
              if (existingBalance.daysOwed > 1) {
                // Reduce the existing debt
                return {
                  balances: state.balances.map((balance) =>
                    balance.trainerId === substituteTrainerId && balance.owesToTrainerId === absentTrainerId
                      ? { ...balance, daysOwed: balance.daysOwed - 1 }
                      : balance,
                  ),
                }
              } else if (existingBalance.daysOwed === 1) {
                // If the debt is exactly 1, remove the balance entirely as they're now even
                return {
                  balances: state.balances.filter(
                    (balance) =>
                      !(balance.trainerId === substituteTrainerId && balance.owesToTrainerId === absentTrainerId),
                  ),
                }
              }
            }
          } else {
            // Create new balance
            return {
              balances: [
                ...state.balances,
                { trainerId: absentTrainerId, owesToTrainerId: substituteTrainerId, daysOwed: 1 },
              ],
            }
          }

          return { balances: state.balances }
        })
      },

      removeSubstitution: (id: string) => {
        const substitution = get().substitutions.find((sub) => sub.id === id)
        if (!substitution) return

        const { absentTrainerId, substituteTrainerId } = substitution

        // Remove the substitution
        set((state) => ({
          substitutions: state.substitutions.filter((sub) => sub.id !== id),
        }))

        // Update balances
        set((state) => {
          // Find existing balance between these trainers
          const existingBalance = state.balances.find(
            (balance) =>
              (balance.trainerId === absentTrainerId && balance.owesToTrainerId === substituteTrainerId) ||
              (balance.trainerId === substituteTrainerId && balance.owesToTrainerId === absentTrainerId),
          )

          if (existingBalance) {
            if (
              existingBalance.trainerId === absentTrainerId &&
              existingBalance.owesToTrainerId === substituteTrainerId
            ) {
              // Decrease the debt
              if (existingBalance.daysOwed > 1) {
                return {
                  balances: state.balances.map((balance) =>
                    balance.trainerId === absentTrainerId && balance.owesToTrainerId === substituteTrainerId
                      ? { ...balance, daysOwed: balance.daysOwed - 1 }
                      : balance,
                  ),
                }
              } else {
                // Remove the balance if it's down to 0
                return {
                  balances: state.balances.filter(
                    (balance) =>
                      !(balance.trainerId === absentTrainerId && balance.owesToTrainerId === substituteTrainerId),
                  ),
                }
              }
            } else {
              // Increase the debt in the opposite direction
              return {
                balances: state.balances.map((balance) =>
                  balance.trainerId === substituteTrainerId && balance.owesToTrainerId === absentTrainerId
                    ? { ...balance, daysOwed: balance.daysOwed + 1 }
                    : balance,
                ),
              }
            }
          }

          return { balances: state.balances }
        })
      },

      getTrainerById: (id: string) => {
        return get().trainers.find((trainer) => trainer.id === id)
      },

      getBalancesBetweenTrainers: (trainer1Id: string, trainer2Id: string) => {
        const balance = get().balances.find(
          (balance) =>
            (balance.trainerId === trainer1Id && balance.owesToTrainerId === trainer2Id) ||
            (balance.trainerId === trainer2Id && balance.owesToTrainerId === trainer1Id),
        )

        if (!balance) return 0

        if (balance.trainerId === trainer1Id && balance.owesToTrainerId === trainer2Id) {
          return balance.daysOwed
        } else {
          return -balance.daysOwed
        }
      },
    }),
    {
      name: "gym-substitution-storage",
    },
  ),
)
