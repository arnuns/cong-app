import { parseThaiAddress, ThaiAddressParts } from './thai-address.parser';

describe('parseThaiAddress', () => {
  it('extracts the employee address used by the Saraburi consent form', () => {
    expect(parseThaiAddress(
      '59/10 หมู่ที่ 12 ต.กะมัง อ.พระนครศรีอยุธยา ' +
      'จ.พระนครศรีอยุธยา 13000'
    )).toEqual({
      houseNumber: '59/10',
      moo: '12',
      soi: '',
      road: '',
      subDistrict: 'กะมัง',
      district: 'พระนครศรีอยุธยา',
      province: 'พระนครศรีอยุธยา',
      postalCode: '13000'
    } as ThaiAddressParts);
  });

  it('supports Bangkok labels and multi-word soi and road values', () => {
    expect(parseThaiAddress(
      '88, ซอย รัชดาภิเษก 18 ถนน สุทธิสารวินิจฉัย ' +
      'แขวง สามเสนนอก เขต ห้วยขวาง กทม. 10310'
    )).toEqual({
      houseNumber: '88',
      moo: '',
      soi: 'รัชดาภิเษก 18',
      road: 'สุทธิสารวินิจฉัย',
      subDistrict: 'สามเสนนอก',
      district: 'ห้วยขวาง',
      province: 'กรุงเทพมหานคร',
      postalCode: '10310'
    } as ThaiAddressParts);
  });

  it('does not treat a village name as a Moo marker', () => {
    expect(parseThaiAddress(
      '99 หมู่บ้านสุขใจ แขวงบางนา เขตบางนา ' +
      'กรุงเทพมหานคร 10260'
    )).toEqual({
      houseNumber: '99 หมู่บ้านสุขใจ',
      moo: '',
      soi: '',
      road: '',
      subDistrict: 'บางนา',
      district: 'บางนา',
      province: 'กรุงเทพมหานคร',
      postalCode: '10260'
    } as ThaiAddressParts);
  });

  it('supports abbreviated labels when optional fields are absent', () => {
    expect(parseThaiAddress(
      '211/41 ถ.สุดบรรทัด ต.ปากเพรียว ' +
      'อ.เมืองสระบุรี จ.สระบุรี 18000'
    )).toEqual({
      houseNumber: '211/41',
      moo: '',
      soi: '',
      road: 'สุดบรรทัด',
      subDistrict: 'ปากเพรียว',
      district: 'เมืองสระบุรี',
      province: 'สระบุรี',
      postalCode: '18000'
    } as ThaiAddressParts);
  });

  it('returns blank fields for an empty address', () => {
    expect(parseThaiAddress('')).toEqual({
      houseNumber: '',
      moo: '',
      soi: '',
      road: '',
      subDistrict: '',
      district: '',
      province: '',
      postalCode: ''
    } as ThaiAddressParts);
  });

  it('preserves unrecognized text in the house-number field', () => {
    expect(parseThaiAddress('อาคารเอ ชั้น 2 10110')).toEqual({
      houseNumber: 'อาคารเอ ชั้น 2',
      moo: '',
      soi: '',
      road: '',
      subDistrict: '',
      district: '',
      province: '',
      postalCode: '10110'
    } as ThaiAddressParts);
  });
});
