import React, { useState } from 'react'
import toast from 'react-hot-toast'
import GroupCard from '../components/groups/GroupCard'
import CreateGroupModal from '../components/groups/CreateGroupModal'
import InviteModal from '../components/groups/InviteModal'
import ConfirmModal from '../components/ui/ConfirmModal'
import EmptyState from '../components/ui/EmptyState'
import { useGroups } from '../hooks/useGroups'
import { useAuth } from '../hooks/useAuth'
import { groupsAPI } from '../utils/api'

export default function GroupsPage() {
  const { user } = useAuth()
  const { groups, loading, addGroup, removeGroup } = useGroups()

  const [showCreate, setShowCreate]     = useState(false)
  const [inviteGroup, setInviteGroup]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await groupsAPI.delete(deleteTarget._id)
      removeGroup(deleteTarget._id)
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Failed to delete group')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-subtitle">Manage your shared expense groups</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowCreate(true)}>
          + New Group
        </button>
      </div>

      {loading ? (
        <div className="full-loading"><span className="loading" /></div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon="👥" title="No groups yet"
          subtitle="Create a group to start splitting expenses"
          action={<button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowCreate(true)}>Create First Group</button>}
        />
      ) : (
        <div className="groups-grid">
          {groups.map(g => (
            <GroupCard
              key={g._id}
              group={g}
              isCreator={g.creator?._id === user._id || g.creator === user._id}
              onInvite={setInviteGroup}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={addGroup} />
      )}
      {inviteGroup && (
        <InviteModal group={inviteGroup} onClose={() => setInviteGroup(null)} />
      )}
      {deleteTarget && (
        <ConfirmModal
          icon="🗑️"
          title={`Delete "${deleteTarget.name}"?`}
          message="This will permanently delete the group and all its data. This cannot be undone."
          confirmLabel="Delete Group"
          confirmClass="btn-danger"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
