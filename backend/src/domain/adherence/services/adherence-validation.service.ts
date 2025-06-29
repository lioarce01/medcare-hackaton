import { Injectable } from '@nestjs/common';
import { Adherence } from '../entities/adherence.entity';
import {
  EntityNotFoundException,
  UnauthorizedAccessException,
  InvalidEntityStateException,
} from '../../common/exceptions/domain.exceptions';

@Injectable()
export class AdherenceValidationService {
  /**
   * Validates that an adherence record exists, belongs to the user, and is in pending status
   */
  validateAdherenceForStatusChange(
    adherence: Adherence | null,
    adherenceId: string,
    userId: string,
  ): void {
    if (!adherence) {
      throw new EntityNotFoundException('Adherence record', adherenceId);
    }

    if (adherence.user_id !== userId) {
      throw new UnauthorizedAccessException('adherence record');
    }

    if (adherence.status !== 'pending' && adherence.status !== 'missed') {
      throw new InvalidEntityStateException(
        'Adherence record',
        adherence.status || 'unknown',
        'pending or missed',
      );
    }
  }
}
