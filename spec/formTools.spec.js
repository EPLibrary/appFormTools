// Run this test at
// file:///Users/jdlien/code/jasmine/SpecRunner.html

describe('formTools', function() {

  const today = new Date()
  const yesterday = new Date()
  const tomorrow = new Date()

  beforeEach(function() {
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)

    yesterday.setHours(0)
    yesterday.setMinutes(0)
    yesterday.setSeconds(0)
    yesterday.setMilliseconds(0)
    yesterday.setDate(today.getDate() - 1)

    tomorrow.setHours(0)
    tomorrow.setMinutes(0)
    tomorrow.setSeconds(0)
    tomorrow.setMilliseconds(0)
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
        expect(time.hour).toBe(12)
        expect(time.minute).toBe(0)
        expect(time.second).toBe(0)

        expect(parseTime('12:00:00').second).toBe(0)

        time = parseTime('12:59:00 PM')
        expect(time.hour).toBe(12)
        expect(time.minute).toBe(59)
        expect(time.second).toBe(0)

        time = parseTime('12:59:00')
        expect(time.hour).toBe(12)
        expect(time.minute).toBe(59)
        expect(time.second).toBe(0)

        // Check AM/PM
        expect(parseTime('24:12').hour).toBe(0)

        time = parseTime('23:59:00')
        expect(time.hour).toBe(23)
        expect(time.minute).toBe(59)
        expect(time.second).toBe(0)

        // Lazy times
        time = parseTime('1p')
        expect(time.hour).toBe(13)
        expect(time.minute).toBe(0)
        expect(time.second).toBe(0)

        // Lazy times
        time = parseTime('11p')
        expect(time.hour).toBe(23)


        time = parseTime('1A')
        expect(time.hour).toBe(1)
        expect(time.minute).toBe(0)
        expect(time.second).toBe(0)

        time = parseTime('12')
        expect(time.hour).toBe(12)
        expect(time.minute).toBe(0)
        expect(time.second).toBe(0)

        time = parseTime('1')
        expect(time.hour).toBe(1)

    })
  })

  describe('parseDate', function() {
    it('returns correct date', () => {
      // We assume a format of YY/MM/DD by default
      expect(parseDate('1/2/3')).toEqual(new Date('2001/02/03'))
      expect(parseDate('2000-2-1')).toEqual(new Date('2000/02/01'))
      expect(parseDate('Jan 5 2000')).toEqual(new Date('2000/01/05'))
      expect(parseDate('5 Jan 99')).toEqual(new Date('1999/01/05'))
      
      // Numbers over 12 will either be date or year
      expect(parseDate('3 30 05')).toEqual(new Date('2003/05/30'))

      expect(parseDate('3 05 30')).toEqual(new Date('2003/05/30'))

      // Anything alphabetic should be interpreted as a month.
      // Also, if the month comes first, and remaining is ambiguous,
      // the second token should be interpreted as the day
      expect(parseDate('en 05 30')).toEqual(new Date('2030/01/05'))
      expect(parseDate('jan/5/30')).toEqual(new Date('2030/01/05'))

      // If the month and year are unambiguous, the remaining token is the day
      expect(parseDate('jan/2005/10')).toEqual(new Date('2005/01/10'))
      
      expect(parseDate('Jan 5, 30')).toEqual(new Date('2030/01/05'))

      // 6-digit number is interpreted as YYMMDD
      expect(parseDate('010203')).toEqual(new Date('2001/02/03'))

      // 8-digit number is interpreted as YYYYMMDD
      expect(parseDate('20010203')).toEqual(new Date('2001/02/03'))

      // 2-digit Year preceeded by apostrophe is always intepreted as year

      expect(parseDate("1 2 '02")).toEqual(new Date('2002/01/02'))
    })
    
    it('adds the current year if no year was given', () => {
      expect(parseDate('02-03')).toEqual(new Date(today.getFullYear()+'/02/03'))
      expect(parseDate('Jan-06')).toEqual(new Date(today.getFullYear()+'/01/06'))
      expect(parseDate('12-30')).toEqual(new Date(today.getFullYear()+'/12/30'))
    })

    it('returns closest date when date is not possible', () => {
      expect(parseDate('1999-02-29')).toEqual(new Date('1999/03/01'))
    })

    it('returns now as today\'s date', () => {
      expect(parseDate('now')).toEqual(today)
      expect(parseDate('hoy')).toEqual(today)
      expect(parseDate('ahora')).toEqual(today)
      expect(parseDate("aujourd'hui")).toEqual(today)
    })

    it('returns yesterday as yesterday\'s date', () => {
      expect(parseDate('yesterday')).toEqual(yesterday)
      expect(parseDate('ayer')).toEqual(yesterday)
      expect(parseDate('hier')).toEqual(yesterday)
    })

    it('returns tomorrow as tomorrow\'s date', () => {
      expect(parseDate('tomorrow')).toEqual(tomorrow)
      expect(parseDate('manana')).toEqual(tomorrow)
      expect(parseDate('demain')).toEqual(tomorrow)
    })

    // TODO: Test that dates with times return the correct time
    it('returns correct time when a time is passed', () => {
      expect(parseDate('2001-04-20 4:00p')).toEqual(new Date(2001, 3, 20, 16, 0, 0, 0))
      // expect(parseDate('manana')).toEqual(tomorrow)
      // expect(parseDate('demain')).toEqual(tomorrow)
    })    

  })

  describe('dateTimeFormat', function() {
    // Just date 
    date1 = new Date(1999, 0, 30)
    date2 = new Date(2040, 11, 31)
    date3 = new Date(2022, 11, 02)
    date4 = new Date(2001, 2, 4)
    dateTime1 = new Date(2019, 1, 5, 9, 08, 6)
    dateTime2 = new Date(2019, 1, 5, 22, 08, 6, 234)

    it('returns all date and time parts', () => {
      expect(dateTimeFormat(date1, 'YY')).toBe('99')
      expect(dateTimeFormat(date2, 'YY')).toBe('40')
      expect(dateTimeFormat(date1, 'YYYY')).toBe('1999')
      expect(dateTimeFormat(date1, 'M')).toBe('1')
      expect(dateTimeFormat(date1, 'MM')).toBe('01')
      expect(dateTimeFormat(date1, 'MMM')).toBe('Jan')
      expect(dateTimeFormat(date1, 'MMMM')).toBe('January')
      expect(dateTimeFormat(date3, 'D')).toBe('2')
      expect(dateTimeFormat(date1, 'DD')).toBe('30')
      expect(dateTimeFormat(date3, 'DD')).toBe('02')
      expect(dateTimeFormat(date1, 'd')).toBe('6')
      expect(dateTimeFormat(date1, 'dd')).toBe('Sa')
      expect(dateTimeFormat(date1, 'ddd')).toBe('Sat')
      expect(dateTimeFormat(date1, 'dddd')).toBe('Saturday')

      expect(dateTimeFormat(dateTime1, 'H')).toBe('9')
      expect(dateTimeFormat(dateTime1, 'HH')).toBe('09')
      expect(dateTimeFormat(dateTime1, 'h')).toBe('9')
      expect(dateTimeFormat(dateTime2, 'h')).toBe('10')
      expect(dateTimeFormat(dateTime1, 'hh')).toBe('09')
      expect(dateTimeFormat(dateTime2, 'hh')).toBe('10')
      expect(dateTimeFormat(dateTime2, 'a')).toBe('pm')
      expect(dateTimeFormat(dateTime2, 'A')).toBe('PM')
      expect(dateTimeFormat(dateTime1, 'a')).toBe('am')
      expect(dateTimeFormat(dateTime1, 'A')).toBe('AM')

      expect(dateTimeFormat(dateTime1, 'm')).toBe('8')
      expect(dateTimeFormat(dateTime1, 'mm')).toBe('08')
      expect(dateTimeFormat(dateTime1, 's')).toBe('6')
      expect(dateTimeFormat(dateTime1, 'ss')).toBe('06')

      expect(dateTimeFormat(dateTime2, 'SSS')).toBe('234')
    })

    it('returns properly formatted date', () => {
      expect(dateTimeFormat(date1, 'YYYY-MMM-DD')).toBe('1999-Jan-30')
      expect(dateTimeFormat(date3, 'MMM DD')).toBe('Dec 02')
      expect(dateTimeFormat(date2, 'DD/MM/YY')).toBe('31/12/40')

      expect(dateTimeFormat(date4, 'D M YY')).toBe('4 3 01')

      expect(dateTimeFormat(date4, 'MMMM D, \'YY')).toBe("March 4, '01")
      expect(dateTimeFormat(date4, 'YYYYMMDD')).toBe('20010304')
      expect(dateTimeFormat(date4, 'YYYYMMD')).toBe('2001034')
      expect(dateTimeFormat(date4, 'YYYYMD')).toBe('200134')
    })
  })

  describe('parseTimeWord', function() {
    const now = new Date()
    console.log(now.getTimezoneOffset())
    console.log(now)

    const noon = new Date()
    toMidnight(noon)
    noon.setHours(12)

    const midnight = new Date()
    toMidnight(midnight)

    it('correct time for each word', () => {
      expect(parseTimeWord('now')).toEqual(now)
      expect(parseTimeWord('ahora')).toEqual(now)
    })
  })


})// end formTools testing