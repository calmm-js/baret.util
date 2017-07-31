import babel       from "rollup-plugin-babel"
import commonjs    from "rollup-plugin-commonjs"
import nodeResolve from "rollup-plugin-node-resolve"
import replace     from "rollup-plugin-replace"
import uglify      from "rollup-plugin-uglify"

export default {
  external: ["infestines",
             "baret",
             "bacon.atom",
             "partial.lenses",
             "prop-types",
             "ramda",
             "baconjs",
             "bacon.combines"],
  globals: {
    "infestines": "I",
    "baret": "baret",
    "baconjs": "Bacon",
    "bacon.combines": "K",
    "bacon.atom": "bacon.atom",
    "partial.lenses": "L",
    "prop-types": "PropTypes",
    "ramda": "R"
  },
  plugins: [
    process.env.NODE_ENV && replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    }),
    nodeResolve(),
    commonjs({include: 'node_modules/**'}),
    babel(),
    process.env.NODE_ENV === "production" &&
      uglify()
  ].filter(x => x)
}
