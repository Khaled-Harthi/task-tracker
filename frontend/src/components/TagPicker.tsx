'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { Tag } from '@/lib/api';
import { Tag as TagIcon, Plus, X, Check } from 'lucide-react';

interface TagPickerProps {
  tags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag?: (data: { name: string; color: string }) => Promise<Tag | undefined>;
}

const TAG_COLORS = [
  '#FF6B6B', // Coral
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];

export function TagPicker({
  tags,
  selectedTagIds,
  onTagsChange,
  onCreateTag,
}: TagPickerProps) {
  const t = useTranslations();
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;

    setCreating(true);
    const newTag = await onCreateTag({ name: newTagName, color: newTagColor });
    setCreating(false);

    if (newTag) {
      onTagsChange([...selectedTagIds, newTag.id]);
      setShowCreate(false);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm text-text-secondary flex items-center gap-2">
        <TagIcon className="w-4 h-4" />
        {t('tags.select')}
      </label>

      {/* Tags grid */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <motion.button
                key={tag.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                  'border transition-all',
                  isSelected
                    ? 'border-current'
                    : 'border-transparent bg-surface-light hover:bg-surface-light/80'
                )}
                style={{
                  color: isSelected ? tag.color : undefined,
                  backgroundColor: isSelected ? `${tag.color}20` : undefined,
                }}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {tag.name}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Add new tag button */}
        {onCreateTag && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(!showCreate)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
              'border border-dashed border-surface-light',
              'text-text-muted hover:text-coral-500 hover:border-coral-500/30',
              'transition-colors'
            )}
          >
            {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCreate ? t('common.cancel') : t('tags.addNew')}
          </motion.button>
        )}
      </div>

      {/* Create new tag form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3 border-t border-surface-light">
              <Input
                placeholder={t('tags.name')}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />

              {/* Color picker */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">{t('tags.color')}:</span>
                <div className="flex gap-1.5">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={cn(
                        'w-6 h-6 rounded-full transition-all',
                        newTagColor === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleCreateTag}
                loading={creating}
                disabled={!newTagName.trim()}
              >
                {t('common.save')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {tags.length === 0 && !showCreate && (
        <p className="text-sm text-text-muted">{t('tags.noTags')}</p>
      )}
    </div>
  );
}
