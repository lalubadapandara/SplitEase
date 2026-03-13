import React from 'react'
import { getInitials } from '../../utils/helpers'

export default function Avatar({ name, size = 'md', style = {} }) {
  const classes = {
    sm: 'avatar avatar-sm',
    md: 'avatar',
    lg: 'avatar avatar-lg',
  }
  return (
    <div className={classes[size] || 'avatar'} style={style}>
      {getInitials(name)}
    </div>
  )
}
