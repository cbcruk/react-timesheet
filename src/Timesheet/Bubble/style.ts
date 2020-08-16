import { css } from 'emotion'

export const date = css`
  color: rgba(181, 181, 181, 1);
  font-size: 14px;
`

export const label = css`
  padding-left: 5px;
  line-height: 21px;
  font-weight: lighter;
  font-size: 14px;
  color: rgba(151, 151, 150, 1);
  white-space: nowrap;
`

export const bubble = css`
  position: relative;
  width: 24px;
  height: 7px;
  border-radius: 4px;
  margin-right: 10px;
  opacity: 0.7;

  &.is-default {
    background-color: RGBA(252, 70, 74, 1);
  }

  &.is-lorem {
    background-color: RGBA(154, 202, 39, 1);
  }

  &.is-ipsum {
    background-color: RGBA(60, 182, 227, 1);
  }

  &.is-dolor {
    background-color: RGBA(244, 207, 48, 1);
  }

  &.is-sit {
    background-color: RGBA(169, 105, 202, 1);
  }
`

export const wrapper = css`
  position: relative;
  display: flex;
  height: 21px;
  margin: 0 0 3px 0;
  line-height: 22px;
  align-items: center;
  white-space: nowrap;

  &:hover {
    ${`.${bubble}`} {
      opacity: 1;
    }
  }
`
