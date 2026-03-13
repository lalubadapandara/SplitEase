import { useState, useEffect, useCallback } from 'react'
import { expensesAPI } from '../utils/api'

export function useExpenses(groupId = null) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = groupId
        ? await expensesAPI.getByGroup(groupId)
        : await expensesAPI.getMy()
      setExpenses(data)
    } catch (e) {
      setError(e)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const addExpense    = (exp)  => setExpenses(prev => [exp, ...prev])
  const removeExpense = (id)   => setExpenses(prev => prev.filter(e => e._id !== id))
  const updateExpense = (updated) => setExpenses(prev => prev.map(e => e._id === updated._id ? updated : e))

  return { expenses, loading, error, refetch: fetchExpenses, addExpense, removeExpense, updateExpense }
}
