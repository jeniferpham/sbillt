const webpackConfig = {
  // Other webpack configurations...
  resolve: {
    fallback: {
      crypto: false,
    },
  },
}
