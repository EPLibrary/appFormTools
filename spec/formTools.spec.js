// Run this test at
// file:///Users/jdlien/code/jasmine/SpecRunner.html

describe('formTools', function() {

  const today = new Date()
  const yesterday = new Date()
  const tomorrow = new Date()

  beforeEach(function() {
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    yesterday.setHours(0);
    yesterday.setMinutes(0);
    yesterday.setSeconds(0);
    yesterday.setMilliseconds(0);
    yesterday.setDate(today.getDate() - 1)

    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    tomorrow.setMilliseconds(0);
    tomorrow.setDate(today.getDate() + 1)
    

  });

  describe('isLeapYear', function() {
      it('returns correct leap year status', () => {
          expect(isLeapYear('1800')).toBe(false)
          expect(isLeapYear(1800)).toBe(false)
          expect(isLeapYear(1803)).toBe(false)
          expect(isLeapYear(1900)).toBe(false)
          expect(isLeapYear(1996)).toBe(true)
          expect(isLeapYear(1997)).toBe(false)
          expect(isLeapYear('1998')).toBe(false)
          expect(isLeapYear(1999)).toBe(false)
          expect(isLeapYear(2000)).toBe(true)
          expect(isLeapYear(2004)).toBe(true)
          expect(isLeapYear(1998)).toBe(false)
          expect(isLeapYear(2096)).toBe(true)
          expect(isLeapYear(2100)).toBe(false)
      })
  })

  describe('monthToString', function() { 
      it('returns correct month', () => {
          expect(monthToString(0, false, false)).toBe('January')
          expect(monthToString('ja', false, false)).toBe('January')
          expect(monthToString('jan', false, false)).toBe('January')
          expect(monthToString('January', false, false)).toBe('January')
          expect(monthToString('january', false, false)).toBe('January')
          expect(monthToString('en', false, false)).toBe('January')
          expect(monthToString('janvier', false, false)).toBe('January')

          expect(monthToString(1, false, false)).toBe('February')
          expect(monthToString('fe', false, false)).toBe('February')
          expect(monthToString('feb', false, false)).toBe('February')
          expect(monthToString('february', false, false)).toBe('February')
          expect(monthToString('Fevrier', false, false)).toBe('February')
          expect(monthToString('fe', false, false)).toBe('February')
          expect(monthToString('fevrier', false, false)).toBe('February')        
      })

      it('returns correct short month', () => {
          expect(monthToString(0, true, false)).toBe('Jan')
          expect(monthToString('ja', true, false)).toBe('Jan')
          expect(monthToString('jan', true, false)).toBe('Jan')
          expect(monthToString('January', true, false)).toBe('Jan')
          expect(monthToString('january', true, false)).toBe('Jan')
          expect(monthToString('en', true, false)).toBe('Jan')
          expect(monthToString('janvier', true, false)).toBe('Jan')

          expect(monthToString(1, true, false)).toBe('Feb')
          expect(monthToString('fe', true, false)).toBe('Feb')
          expect(monthToString('february', true, false)).toBe('Feb')
          expect(monthToString('feb', true, false)).toBe('Feb')
          expect(monthToString('Fevrier', true, false)).toBe('Feb')
          expect(monthToString('fe', true, false)).toBe('Feb')
          expect(monthToString('fevrier', true, false)).toBe('Feb')        
      })    

      it('returns correct month with one-based', () => {
          expect(monthToString(1, false, true)).toBe('January')
          expect(monthToString(2, false, true)).toBe('February')
          expect(monthToString(12, false, true)).toBe('December')
      })

      it('returns correct month number', () => {
          expect(monthToString(0, false, false, true)).toBe(0)
          expect(monthToString('jan', false, false, true)).toBe(0)
          expect(monthToString('dé', false, false, true)).toBe(11)
      })

      it('returns correct month number with one-based', () => {
          expect(monthToString(1, false, true, true)).toBe(1)
          expect(monthToString('jan', false, true, true)).toBe(1)
          expect(monthToString('dé', false, true, true)).toBe(12)
      })

      it('returns correct month with monthToInt', () => {
          expect(monthToInt(1, 1)).toBe(1)
          expect(monthToInt('jan', 0)).toBe(0)
          expect(monthToInt('dé', true)).toBe(12)        
      })
    })
    

    describe('parseTime', function() {
    it('returns correct time parts', () => {
        let time
        time = parseTime('12:00')
        expect(time.meridiem).toBe('PM')
        expect(time.hour).toBe(12)
        expect(time.minute).toBe(0)
        expect(time.second).toBe(0)

        expect(parseTime('12:00:00').second).toBe(0)

        time = parseTime('12:59:00 PM')
        expect(time.meridiem).toBe('PM')
        expect(time.hour).toBe(12)
        expect(time.minute).toBe(59)
        expect(time.second).toBe(0)

        time = parseTime('12:59:00')
        expect(time.meridiem).toBe('PM')
        expect(time.hour).toBe(12)
        expect(time.minute).toBe(59)
        expect(time.second).toBe(0)

        expect(parseTime('12:59 AM').meridiem).toBe('AM')
        expect(parseTime('12:59:00 AM').meridiem).toBe('AM')

        // Check AM/PM
        expect(parseTime('00:12').meridiem).toBe('AM')
        expect(parseTime('12:12').meridiem).toBe('PM')
        expect(parseTime('13:12').meridiem).toBe('PM')
        expect(parseTime('23:12').meridiem).toBe('PM')
        expect(parseTime('24:12').meridiem).toBe('AM')
        expect(parseTime('24:12').hour).toBe(0)

        time = parseTime('23:59:00')
        expect(time.meridiem).toBe('PM')
        expect(time.hour).toBe(23)
        expect(time.minute).toBe(59)
        expect(time.second).toBe(0)

        // Lazy times
        time = parseTime('1p')
        expect(time.hour).toBe(13)
        expect(time.minute).toBe(0)
        expect(time.second).toBe(0)
        expect(time.meridiem).toBe('PM')

        time = parseTime('1A')
        expect(time.hour).toBe(1)
        expect(time.minute).toBe(0)
        expect(time.second).toBe(0)
        expect(time.meridiem).toBe('AM')

        time = parseTime('12')
        expect(time.hour).toBe(12)
        expect(time.minute).toBe(0)
        expect(time.second).toBe(0)
        expect(time.meridiem).toBe('PM')

        time = parseTime('1')
        expect(time.hour).toBe(1)
        expect(time.meridiem).toBe('AM')

    })
  })

  describe('dateSanitize', function() {
    it('returns correct date', () => {
      // We assume a format of YY/MM/DD by default
      expect(dateSanitize('1/2/3')).toEqual(new Date('2001/02/03'))
      expect(dateSanitize('2000-2-1')).toEqual(new Date('2000/02/01'))
      expect(dateSanitize('Jan 5 2000')).toEqual(new Date('2000/01/05'))
      expect(dateSanitize('5 Jan 99')).toEqual(new Date('1999/01/05'))
      
      // Numbers over 12 will either be date or year
      expect(dateSanitize('3 30 05')).toEqual(new Date('2003/05/30'))

      expect(dateSanitize('3 05 30')).toEqual(new Date('2003/05/30'))

      // Anything alphabetic should be interpreted as a month.
      // Also, if the month comes first, and remaining is ambiguous,
      // the second token should be interpreted as the day
      expect(dateSanitize('en 05 30')).toEqual(new Date('2030/01/05'))
      expect(dateSanitize('jan/5/30')).toEqual(new Date('2030/01/05'))

      // If the month and year are unambiguous, the remaining token is the day
      expect(dateSanitize('jan/2005/10')).toEqual(new Date('2005/01/10'))
      
      expect(dateSanitize('Jan 5, 30')).toEqual(new Date('2030/01/05'))

      // 6-digit number is interpreted as YYMMDD
      expect(dateSanitize('010203')).toEqual(new Date('2001/02/03'))

      // 8-digit number is interpreted as YYYYMMDD
      expect(dateSanitize('20010203')).toEqual(new Date('2001/02/03'))
    })
    
    it('adds the current year if no year was given', () => {
      expect(dateSanitize('02-03')).toEqual(new Date(today.getFullYear()+'/02/03'))
      expect(dateSanitize('Jan-06')).toEqual(new Date(today.getFullYear()+'/01/06'))
      expect(dateSanitize('12-30')).toEqual(new Date(today.getFullYear()+'/12/30'))
    })

    it('returns closest date when date is not possible', () => {
      expect(dateSanitize('1999-02-29')).toEqual(new Date('1999/03/01'))
    })

    it('returns now as today\'s date', () => {
      expect(dateSanitize('now')).toEqual(today)
      expect(dateSanitize('hoy')).toEqual(today)
      expect(dateSanitize('ahora')).toEqual(today)
      expect(dateSanitize("aujourd'hui")).toEqual(today)
    })

    it('returns yesterday as yesterday\'s date', () => {
      expect(dateSanitize('yesterday')).toEqual(yesterday)
      expect(dateSanitize('ayer')).toEqual(yesterday)
      expect(dateSanitize('hier')).toEqual(yesterday)
    })

    it('returns tomorrow as tomorrow\'s date', () => {
      expect(dateSanitize('tomorrow')).toEqual(tomorrow)
      expect(dateSanitize('manana')).toEqual(tomorrow)
      expect(dateSanitize('demain')).toEqual(tomorrow)
    })

  })

})// end formTools testing