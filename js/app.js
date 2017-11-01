!function(lo) {
  
    _.redirect = function(url, fn) {
      if (!arguments.length) return _.if(function() { location.reload() });
      return function(res) {
        if (!res) return (fn || _(_.loge, 'result: ' + res))();
        window.location.href = /\?$/.test(url) ? _.reduce(res, function(m, v, k) { return v ? m += '&'+k+'='+v : m }, url) : _.s$(url)(res);
      };
    };
  
    _.debug_ = function() {
      var args = arguments;
      var i = 0;
      var new_args = _.reduce(args, function(memo, arg) {
          return memo.concat(arg, _.Hi('debug-----' + ++i))
        }, []);
      return _.pipe.apply(null, new_args);
    };
  
    _.debug = function() {
      var args = _.rest(arguments);
      args.unshift(_.Hi('~~~~~~~~~~lets git it~~~~~~~~~~~~'));
      return _.debug_.apply(null, args)(_.first(arguments))
    };
  
    function _memoize(fn1, fn2) {
      function f(...args) {
        let key = fn2(...args);
        return f.cache[key] ? f.cache[key] : (f.cache[key] = fn1(...args));
      }
      return f.cache = {}, f;
    }
  
    function _keyCode(num) {
      return function() {
        var fns = arguments;
        return function(e) {
          if (e.keyCode == num) return _.go.apply(null, [e].concat(fns));
        }
      }
    }
  
    function _confirm(msg, s_fn, f_fn) {
      return function(data) {
        return confirm(msg) ? s_fn(data) : f_fn(data);
      }
    }
  
    lo.is_enter = _keyCode(13);
  
    _.each($('.movie_box'), __(
      _.c(movies),
      _.t$(`
        .header
          .title 
            h3 한국 영화 무비 박스
          .filter
            .rating
              label 등급 
              .inputs {{_.go($, _.map(m => m.rating), _.uniq, _.sum(`, _.t$(`
                input[type=checkbox name=rating value='{{$}}'] {{$}}
              `) ,`))}}
            .genre
              label 장르 
              .inputs {{_.go($, _.map(m => m.genre), _.uniq, _.sum(`, _.t$(`
                input[type=checkbox name=genre value='{{$}}'] {{$}}
              `) ,`))}}
            .director
              label 감독 
              .inputs {{_.go($, _.map(m => m.director), _.uniq, _.sum(`, _.t$(`
                input[type=checkbox name=director value='{{$}}'] {{$}}
              `) ,`))}}
          .sort
            label 정렬
            select
              option[value=name] 이름
              option[value=attendance] 관객수
              option[value=comment] 댓글
              option[value=like] 좋아요
        .body
          ul.movie_list {{_.go($, `, lo.items = _.sum(_.t$(`
            li.movie_item {{$.name}} | {{$.date}} | {{$.director}} | {{$.genre}} | {{$.rating}} [ {{$.attendance}} | {{$.like}} | {{$.comment}} ]
          `)) ,`)}}
          .extension
            .search
              input.finder[placeholder=검색] 
            .btns
              button.btn1 가장 개봉한 영화가 가장 많았던 해의 총 관람객 수
              button.btn2 2000년대 개봉한 영화 중 가장 관객수가 적은 영화
              button.btn3 12세 이상 관람가 중에서 김기덕 감독의 영화가 아닌 영화 다섯편
      `),
      D.prepend_to('.movie_box'),
  
      _.c('.movie_box'), D,
      D.on('change', '.filter input[type=checkbox]', __(
        _.always("input:checked"), D,
        lo.group_by_filter_name = _.reduce((result, c) =>
          ((result[c.name] ? result[c.name].push(c.value) : result[c.name] = [c.value]), result), {}),
        checked_map => !_.is_empty(checked_map) ? checked_map :
          (lo.filter_value_map || (lo.filter_value_map = lo.group_by_filter_name(D('.inputs input')))),
        _memoize( // movie_filter
          checked_map => {
            return _.filter(movies, m => {
              return _.every(_.map(checked_map, (arr, key) => _.contains(arr, m[key])))
            })
          },
          checked_map => _.reduce(checked_map, (str, arr, key) => str + arr.join() + key, '')
        ),
        data => lo.current_list = data,
        lo.items,
        D.html_to('.movie_list'))),
  
      D.on('change', '.sort select', __(
        e => _.sort_by(lo.current_list || movies, e.$currentTarget.value),
        lo.items,
        D.html_to('.movie_list'))),
  
      D.on('keydown', '.extension .search input.finder', __(
        lo.is_enter(
          _.val('$currentTarget.value'),
          _confirm('going?', _.redirect('https://www.marpple.com/'), _.loge))
      )),
  
      // - 가장 개봉한 영화가 많았던 해의 총 관람객 수
      D.on('click', '.extension .btn1', __(
        () =>
          _.debug(
            lo.current_list || movies,
            _.group_by(v => v.date.slice(0, 4)),
            _.max('length'),
            _.reduce((m, v) => m + v.attendance, 0)),
        _.log)),
  
      // - 2000년대 개봉한 영화 중 가장 관객수가 적은 영화
      D.on('click', '.extension .btn2', __(
        () =>
          _.go(
            lo.current_list || movies,
            _.group_by(v => v.date.slice(0, 4)),
            _.val('2000'),
            _.min('attendance'),
            _.val('name')),
        _.log)),
  
      // - 12세 이상 관람가 중에서 김기덕 감독의 영화가 아닌 영화 다섯편
      D.on('click', '.extension .btn3', __(
        () =>
          _.go(
            lo.current_list || movies,
            _.filter(movie => {
              count++;
              return movie.rating === '12세 이상 관람가' }),
            _.reject(movie => {
              count++;
              return movie.director === '김기덕' }),
            _.take(2)),
        _.log))
    ))
  
    window.count = 0;
  }({});
  
  
  // D.on('keydown', '.search', function(e) {
  //   if (e.keyCode) {
  //
  //   }
  // })
  
  function _nest(keys, value) {
    return _.reduceRight(keys.split('.'), (val, key) => {
      return {[key]: val};
    }, value)
  }
  
  _.log(_nest('a.b.c', 10));
  
  
  // // movie_api
  // let
  //   key = '71ff5e4df13de121c522d28d5afe4b5d',
  //   base_url = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json',
  //   limit = 1000,
  //   year = 1990,
  //   url = `${base_url}?key=${key}&itemPerPage=${limit}&openStartDt=${year}&openEndDt=${year}`;
  //
  // fetch(url)
  //   .then(res => res.json())
  //   .then(_.v('movieListResult.movieList'))
  //   .then(_.filter(m => m.nationAlt == '한국'))
  //   .then(_.log)