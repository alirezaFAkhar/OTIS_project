'use client';

import { Member } from '../types';
import MemberCard from './MemberCard';

interface MemberCardListProps {
  members: Member[];
}

export default function MemberCardList({ members }: MemberCardListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        هیچ کاربری یافت نشد
      </div>
    );
  }

  return (
    <div className="lg:hidden space-y-4">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

