import * as origin from 'checksum';
import { ChecksumOptions } from 'checksum';

type checksumType = typeof origin;
jest.genMockFromModule<checksumType>('checksum');

export default (_a: string, _b?: ChecksumOptions) => 'mock_checksum';
