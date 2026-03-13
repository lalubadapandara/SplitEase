import { useState, useEffect, useCallback } from 'react'
import { groupsAPI } from '../utils/api'

export function useGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await groupsAPI.getAll()
      setGroups(data)
    } catch (e) {
      setError(e)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const addGroup = (group) => setGroups(prev => [group, ...prev])
  const removeGroup = (id) => setGroups(prev => prev.filter(g => g._id !== id))

  return { groups, loading, error, refetch: fetchGroups, addGroup, removeGroup }
}
