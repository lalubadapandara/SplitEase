import React from 'react'
import { Link } from 'react-router-dom'
import { getInitials } from '../../utils/helpers'

export default function GroupCard({ group, onDelete, onInvite, isCreator }) {
  const stopProp = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(e) }

  return (
    <div style={{ position: 'relative' }}>
      <Link to={`/groups/${group._id}`} className="group-card">
        <div className="group-icon">{group.icon || '👥'}</div>
        <div className="group-name">{group.name}</div>
        <div className="group-meta">{group.members?.length || 0} members</div>
        <div className="member-avatars">
          {(group.members || []).slice(0, 4).map(m => (
            <div key={m._id} className="member-avatar-sm">{getInitials(m.name)}</div>
          ))}
          {(group.members?.length || 0) > 4 && (
            <div className="member-avatar-sm">+{group.members.length - 4}</div>
          )}
        </div>
        {/* Action row at bottom of card */}
        <div
          style={{
            display: 'flex', gap: 6, marginTop: 14,
            paddingTop: 12, borderTop: '1px solid var(--border)',
          }}
          onClick={stopProp(() => {})}
        >
          <button
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: 11 }}
            onClick={stopProp(() => onInvite?.(group))}
          >
            🔗 Invite
          </button>
          {isCreator && (
            <button
              className="btn btn-danger btn-sm"
              style={{ flex: 1, fontSize: 11 }}
              onClick={stopProp(() => onDelete?.(group))}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </Link>
    </div>
  )
}
