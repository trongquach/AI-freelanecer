import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { skillApi, type Skill } from '@/api/skillApi'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import * as Command from 'cmdk' // we might not have cmdk, let's use a simpler custom dropdown or just a native multiple select if cmdk isn't available.

// Since we don't know if cmdk is installed, I'll implement a simple custom dropdown.
export default function SkillSelector({ 
  selectedIds, 
  onChange 
}: { 
  selectedIds: number[], 
  onChange: (ids: number[]) => void 
}) {
  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: skillApi.getAll
  })

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSkill = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const selectedSkills = skills.filter(s => selectedIds.includes(s.id))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSkills.map(s => (
          <span key={s.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
            {s.name}
            <button type="button" onClick={() => toggleSkill(s.id)} className="hover:text-primary-900 focus:outline-none">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button 
            type="button" 
            className="flex items-center justify-between w-full input bg-white text-left text-slate-600 hover:bg-slate-50"
            disabled={isLoading}
          >
            {isLoading ? 'Loading skills...' : 'Select skills...'}
            <ChevronsUpDown className="w-4 h-4 text-slate-400" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="w-[var(--radix-popover-trigger-width)] bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-50 max-h-60 overflow-hidden flex flex-col" align="start" sideOffset={4}>
            <input 
              type="text" 
              placeholder="Search skills..." 
              className="w-full px-3 py-2 text-sm border-b border-slate-100 focus:outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="overflow-y-auto flex-1 p-1">
              {filteredSkills.length === 0 ? (
                <div className="p-4 text-sm text-center text-slate-500">No skills found.</div>
              ) : (
                filteredSkills.map(skill => {
                  const isSelected = selectedIds.includes(skill.id)
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-md hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                    >
                      <span>
                        <span className="font-medium text-slate-700">{skill.name}</span>
                        <span className="ml-2 text-xs text-slate-400">{skill.category}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                    </button>
                  )
                })
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
