import { SetMetadata } from '@nestjs/common';

import { ROUTE_METADATA_KEYS } from '../../shared/constants/enums/route-metadata-keys';

export const PublicRoute = () =>
  SetMetadata(ROUTE_METADATA_KEYS.IS_PUBLIC_ROUTE, true);
