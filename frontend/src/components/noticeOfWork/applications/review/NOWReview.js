import React from "react";
import { PropTypes } from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Divider, Row, Col } from "antd";
import RenderField from "@/components/common/RenderField";
import * as FORM from "@/constants/forms";
import ScrollContentWrapper from "@/components/common/wrappers/ScrollContentWrapper";

/**
 * @constant NOWReview renders edit/view for the NoW Application review step
 */

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
};

export const NOWReview = (props) => {
  return (
    <div>
      <Form layout="vertical" onSubmit={() => console.log("submitting form")}>
        <div className="side-menu--content">
          <h2>General Information</h2>
          <Divider />
          <ScrollContentWrapper id="application-info" title="Application Info">
            <div>
              <Row gutter={16}>
                <Col md={12} sm={24}>
                  <div className="field-title">Name of Property</div>
                  <Field
                    id="pproperty_name"
                    name="property_name"
                    component={RenderField}
                    disabled={props.isViewMode}
                  />
                </Col>
                <Col md={12} sm={24}>
                  <div className="field-title"> Permit Status </div>
                  <Field
                    id="permit_status_code"
                    name="permit_status_code"
                    component={RenderField}
                    disabled={props.isViewMode}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col md={12} sm={24}>
                  <div className="field-title">Mine Number</div>

                  <Field id="mine_no" name="mine_no" component={RenderField} disabled />
                </Col>
                <Col md={12} sm={24}>
                  <div className="field-title">Individual or Company/Organization?</div>
                  <Field
                    id="permit_status_code"
                    name="permit_status_code"
                    component={RenderField}
                    disabled={props.isViewMode}
                  />
                </Col>
              </Row>
            </div>
          </ScrollContentWrapper>
          <ScrollContentWrapper id="contacts" title="Contacts">
            <h1>Contacts</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus turpis arcu,
              lobortis sit amet vehicula ac, maximus sed felis. Aenean pharetra mattis ante sit amet
              sollicitudin. Nunc eu iaculis lacus. Curabitur euismod odio volutpat, commodo felis
              ac, rutrum mi. Sed orci magna, mattis vel pulvinar in, tempus quis dolor. Aliquam
              sodales vitae arcu nec posuere. Cras eget posuere nulla. Praesent nibh arcu, tincidunt
              at sodales quis, consectetur et lacus. Vivamus malesuada eleifend gravida. Nam
              ullamcorper, mi commodo tempus convallis, augue sem efficitur justo, ac finibus leo
              velit ut augue. Vestibulum sagittis elit id porta molestie. Duis ut tellus in tortor
              gravida congue. Vestibulum molestie hendrerit arcu, vitae accumsan orci blandit vel.
              Mauris nec lorem sit amet quam consectetur fringilla. Mauris sapien risus, cursus eu
              aliquam sed, vulputate ut lorem. Nam nec tellus at libero euismod auctor ac nec massa.
              Curabitur tincidunt blandit mollis. Suspendisse interdum eu justo non mollis. Proin eu
              nibh faucibus, faucibus dolor viverra, pharetra erat. Integer non arcu non nunc
              vestibulum laoreet. Sed sagittis volutpat nibh. Proin sed odio quis mauris mollis
              auctor. Morbi egestas nunc interdum mauris auctor, sit amet dignissim tortor mollis.
              Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam dui tortor,
              fringilla euismod volutpat efficitur, sollicitudin vel augue. Proin neque lectus,
              sodales eu sem ac, mattis elementum mauris. Morbi sollicitudin diam a mi pulvinar, ac
              pretium nisl porta. Donec quis maximus dui. Nam porta finibus eleifend. Curabitur
              gravida tincidunt rhoncus. Aliquam sagittis nulla eget lorem suscipit tempus. Integer
              id ipsum in sapien imperdiet egestas in vel eros. Duis quis risus erat. Mauris
              volutpat consectetur est quis mattis. Vestibulum quis dignissim ex, ac vehicula velit.
              Donec tristique faucibus lacus et sodales. In hac habitasse platea dictumst. Mauris
              euismod pharetra ante in volutpat. In cursus justo non elementum venenatis. In
              pharetra sed nisi ac dapibus. Maecenas vel arcu nec ex vulputate luctus eu et felis.
              Vestibulum tempor egestas nibh nec elementum. Maecenas mattis condimentum odio, at
              lobortis dui posuere non. Mauris luctus leo vel lectus ultricies dapibus. Nullam
              fermentum aliquam ultrices. Donec egestas sit amet neque congue efficitur. Sed iaculis
              turpis sed venenatis eleifend. Sed quis velit vel elit ornare sodales suscipit nec
              urna. Maecenas vitae sapien sem. Nam aliquam suscipit pretium. Pellentesque a odio
              mauris. Maecenas et neque ac mi maximus gravida. Nullam eu scelerisque tellus, id
              consectetur nulla. Vestibulum volutpat, justo sed elementum bibendum, purus arcu
              accumsan purus, et sagittis lectus mauris nec orci. Nunc malesuada vitae orci sit amet
              maximus. Suspendisse vel consectetur risus, a porttitor velit. Nullam eu ante eget
              magna lobortis congue. Phasellus molestie sollicitudin dolor.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus turpis arcu,
              lobortis sit amet vehicula ac, maximus sed felis. Aenean pharetra mattis ante sit amet
              sollicitudin. Nunc eu iaculis lacus. Curabitur euismod odio volutpat, commodo felis
              ac, rutrum mi. Sed orci magna, mattis vel pulvinar in, tempus quis dolor. Aliquam
              sodales vitae arcu nec posuere. Cras eget posuere nulla. Praesent nibh arcu, tincidunt
              at sodales quis, consectetur et lacus. Vivamus malesuada eleifend gravida. Nam
              ullamcorper, mi commodo tempus convallis, augue sem efficitur justo, ac finibus leo
              velit ut augue. Vestibulum sagittis elit id porta molestie. Duis ut tellus in tortor
              gravida congue. Vestibulum molestie hendrerit arcu, vitae accumsan orci blandit vel.
              Mauris nec lorem sit amet quam consectetur fringilla. Mauris sapien risus, cursus eu
              aliquam sed, vulputate ut lorem. Nam nec tellus at libero euismod auctor ac nec massa.
              Curabitur tincidunt blandit mollis. Suspendisse interdum eu justo non mollis. Proin eu
              nibh faucibus, faucibus dolor viverra, pharetra erat. Integer non arcu non nunc
              vestibulum laoreet. Sed sagittis volutpat nibh. Proin sed odio quis mauris mollis
              auctor. Morbi egestas nunc interdum mauris auctor, sit amet dignissim tortor mollis.
              Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam dui tortor,
              fringilla euismod volutpat efficitur, sollicitudin vel augue. Proin neque lectus,
              sodales eu sem ac, mattis elementum mauris. Morbi sollicitudin diam a mi pulvinar, ac
              pretium nisl porta. Donec quis maximus dui. Nam porta finibus eleifend. Curabitur
              gravida tincidunt rhoncus. Aliquam sagittis nulla eget lorem suscipit tempus. Integer
              id ipsum in sapien imperdiet egestas in vel eros. Duis quis risus erat. Mauris
              volutpat consectetur est quis mattis. Vestibulum quis dignissim ex, ac vehicula velit.
              Donec tristique faucibus lacus et sodales. In hac habitasse platea dictumst. Mauris
              euismod pharetra ante in volutpat. In cursus justo non elementum venenatis. In
              pharetra sed nisi ac dapibus. Maecenas vel arcu nec ex vulputate luctus eu et felis.
              Vestibulum tempor egestas nibh nec elementum. Maecenas mattis condimentum odio, at
              lobortis dui posuere non. Mauris luctus leo vel lectus ultricies dapibus. Nullam
              fermentum aliquam ultrices. Donec egestas sit amet neque congue efficitur. Sed iaculis
              turpis sed venenatis eleifend. Sed quis velit vel elit ornare sodales suscipit nec
              urna. Maecenas vitae sapien sem. Nam aliquam suscipit pretium. Pellentesque a odio
              mauris. Maecenas et neque ac mi maximus gravida. Nullam eu scelerisque tellus, id
              consectetur nulla. Vestibulum volutpat, justo sed elementum bibendum, purus arcu
              accumsan purus, et sagittis lectus mauris nec orci. Nunc malesuada vitae orci sit amet
              maximus. Suspendisse vel consectetur risus, a porttitor velit. Nullam eu ante eget
              magna lobortis congue. Phasellus molestie sollicitudin dolor.
            </p>
          </ScrollContentWrapper>
          <ScrollContentWrapper id="access" title="Access">
            <h1>Access</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus turpis arcu,
              lobortis sit amet vehicula ac, maximus sed felis. Aenean pharetra mattis ante sit amet
              sollicitudin. Nunc eu iaculis lacus. Curabitur euismod odio volutpat, commodo felis
              ac, rutrum mi. Sed orci magna, mattis vel pulvinar in, tempus quis dolor. Aliquam
              sodales vitae arcu nec posuere. Cras eget posuere nulla. Praesent nibh arcu, tincidunt
              at sodales quis, consectetur et lacus. Vivamus malesuada eleifend gravida. Nam
              ullamcorper, mi commodo tempus convallis, augue sem efficitur justo, ac finibus leo
              velit ut augue. Vestibulum sagittis elit id porta molestie. Duis ut tellus in tortor
              gravida congue. Vestibulum molestie hendrerit arcu, vitae accumsan orci blandit vel.
              Mauris nec lorem sit amet quam consectetur fringilla. Mauris sapien risus, cursus eu
              aliquam sed, vulputate ut lorem. Nam nec tellus at libero euismod auctor ac nec massa.
              Curabitur tincidunt blandit mollis. Suspendisse interdum eu justo non mollis. Proin eu
              nibh faucibus, faucibus dolor viverra, pharetra erat. Integer non arcu non nunc
              vestibulum laoreet. Sed sagittis volutpat nibh. Proin sed odio quis mauris mollis
              auctor. Morbi egestas nunc interdum mauris auctor, sit amet dignissim tortor mollis.
              Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam dui tortor,
              fringilla euismod volutpat efficitur, sollicitudin vel augue. Proin neque lectus,
              sodales eu sem ac, mattis elementum mauris. Morbi sollicitudin diam a mi pulvinar, ac
              pretium nisl porta. Donec quis maximus dui. Nam porta finibus eleifend. Curabitur
              gravida tincidunt rhoncus. Aliquam sagittis nulla eget lorem suscipit tempus. Integer
              id ipsum in sapien imperdiet egestas in vel eros. Duis quis risus erat. Mauris
              volutpat consectetur est quis mattis. Vestibulum quis dignissim ex, ac vehicula velit.
              Donec tristique faucibus lacus et sodales. In hac habitasse platea dictumst. Mauris
              euismod pharetra ante in volutpat. In cursus justo non elementum venenatis. In
              pharetra sed nisi ac dapibus. Maecenas vel arcu nec ex vulputate luctus eu et felis.
              Vestibulum tempor egestas nibh nec elementum. Maecenas mattis condimentum odio, at
              lobortis dui posuere non. Mauris luctus leo vel lectus ultricies dapibus. Nullam
              fermentum aliquam ultrices. Donec egestas sit amet neque congue efficitur. Sed iaculis
              turpis sed venenatis eleifend. Sed quis velit vel elit ornare sodales suscipit nec
              urna. Maecenas vitae sapien sem. Nam aliquam suscipit pretium. Pellentesque a odio
              mauris. Maecenas et neque ac mi maximus gravida. Nullam eu scelerisque tellus, id
              consectetur nulla. Vestibulum volutpat, justo sed elementum bibendum, purus arcu
              accumsan purus, et sagittis lectus mauris nec orci. Nunc malesuada vitae orci sit amet
              maximus. Suspendisse vel consectetur risus, a porttitor velit. Nullam eu ante eget
              magna lobortis congue. Phasellus molestie sollicitudin dolor.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus turpis arcu,
              lobortis sit amet vehicula ac, maximus sed felis. Aenean pharetra mattis ante sit amet
              sollicitudin. Nunc eu iaculis lacus. Curabitur euismod odio volutpat, commodo felis
              ac, rutrum mi. Sed orci magna, mattis vel pulvinar in, tempus quis dolor. Aliquam
              sodales vitae arcu nec posuere. Cras eget posuere nulla. Praesent nibh arcu, tincidunt
              at sodales quis, consectetur et lacus. Vivamus malesuada eleifend gravida. Nam
              ullamcorper, mi commodo tempus convallis, augue sem efficitur justo, ac finibus leo
              velit ut augue. Vestibulum sagittis elit id porta molestie. Duis ut tellus in tortor
              gravida congue. Vestibulum molestie hendrerit arcu, vitae accumsan orci blandit vel.
              Mauris nec lorem sit amet quam consectetur fringilla. Mauris sapien risus, cursus eu
              aliquam sed, vulputate ut lorem. Nam nec tellus at libero euismod auctor ac nec massa.
              Curabitur tincidunt blandit mollis. Suspendisse interdum eu justo non mollis. Proin eu
              nibh faucibus, faucibus dolor viverra, pharetra erat. Integer non arcu non nunc
              vestibulum laoreet. Sed sagittis volutpat nibh. Proin sed odio quis mauris mollis
              auctor. Morbi egestas nunc interdum mauris auctor, sit amet dignissim tortor mollis.
              Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam dui tortor,
              fringilla euismod volutpat efficitur, sollicitudin vel augue. Proin neque lectus,
              sodales eu sem ac, mattis elementum mauris. Morbi sollicitudin diam a mi pulvinar, ac
              pretium nisl porta. Donec quis maximus dui. Nam porta finibus eleifend. Curabitur
              gravida tincidunt rhoncus. Aliquam sagittis nulla eget lorem suscipit tempus. Integer
              id ipsum in sapien imperdiet egestas in vel eros. Duis quis risus erat. Mauris
              volutpat consectetur est quis mattis. Vestibulum quis dignissim ex, ac vehicula velit.
              Donec tristique faucibus lacus et sodales. In hac habitasse platea dictumst. Mauris
              euismod pharetra ante in volutpat. In cursus justo non elementum venenatis. In
              pharetra sed nisi ac dapibus. Maecenas vel arcu nec ex vulputate luctus eu et felis.
              Vestibulum tempor egestas nibh nec elementum. Maecenas mattis condimentum odio, at
              lobortis dui posuere non. Mauris luctus leo vel lectus ultricies dapibus. Nullam
              fermentum aliquam ultrices. Donec egestas sit amet neque congue efficitur. Sed iaculis
              turpis sed venenatis eleifend. Sed quis velit vel elit ornare sodales suscipit nec
              urna. Maecenas vitae sapien sem. Nam aliquam suscipit pretium. Pellentesque a odio
              mauris. Maecenas et neque ac mi maximus gravida. Nullam eu scelerisque tellus, id
              consectetur nulla. Vestibulum volutpat, justo sed elementum bibendum, purus arcu
              accumsan purus, et sagittis lectus mauris nec orci. Nunc malesuada vitae orci sit amet
              maximus. Suspendisse vel consectetur risus, a porttitor velit. Nullam eu ante eget
              magna lobortis congue. Phasellus molestie sollicitudin dolor.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus turpis arcu,
              lobortis sit amet vehicula ac, maximus sed felis. Aenean pharetra mattis ante sit amet
              sollicitudin. Nunc eu iaculis lacus. Curabitur euismod odio volutpat, commodo felis
              ac, rutrum mi. Sed orci magna, mattis vel pulvinar in, tempus quis dolor. Aliquam
              sodales vitae arcu nec posuere. Cras eget posuere nulla. Praesent nibh arcu, tincidunt
              at sodales quis, consectetur et lacus. Vivamus malesuada eleifend gravida. Nam
              ullamcorper, mi commodo tempus convallis, augue sem efficitur justo, ac finibus leo
              velit ut augue. Vestibulum sagittis elit id porta molestie. Duis ut tellus in tortor
              gravida congue. Vestibulum molestie hendrerit arcu, vitae accumsan orci blandit vel.
              Mauris nec lorem sit amet quam consectetur fringilla. Mauris sapien risus, cursus eu
              aliquam sed, vulputate ut lorem. Nam nec tellus at libero euismod auctor ac nec massa.
              Curabitur tincidunt blandit mollis. Suspendisse interdum eu justo non mollis. Proin eu
              nibh faucibus, faucibus dolor viverra, pharetra erat. Integer non arcu non nunc
              vestibulum laoreet. Sed sagittis volutpat nibh. Proin sed odio quis mauris mollis
              auctor. Morbi egestas nunc interdum mauris auctor, sit amet dignissim tortor mollis.
              Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam dui tortor,
              fringilla euismod volutpat efficitur, sollicitudin vel augue. Proin neque lectus,
              sodales eu sem ac, mattis elementum mauris. Morbi sollicitudin diam a mi pulvinar, ac
              pretium nisl porta. Donec quis maximus dui. Nam porta finibus eleifend. Curabitur
              gravida tincidunt rhoncus. Aliquam sagittis nulla eget lorem suscipit tempus. Integer
              id ipsum in sapien imperdiet egestas in vel eros. Duis quis risus erat. Mauris
              volutpat consectetur est quis mattis. Vestibulum quis dignissim ex, ac vehicula velit.
              Donec tristique faucibus lacus et sodales. In hac habitasse platea dictumst. Mauris
              euismod pharetra ante in volutpat. In cursus justo non elementum venenatis. In
              pharetra sed nisi ac dapibus. Maecenas vel arcu nec ex vulputate luctus eu et felis.
              Vestibulum tempor egestas nibh nec elementum. Maecenas mattis condimentum odio, at
              lobortis dui posuere non. Mauris luctus leo vel lectus ultricies dapibus. Nullam
              fermentum aliquam ultrices. Donec egestas sit amet neque congue efficitur. Sed iaculis
              turpis sed venenatis eleifend. Sed quis velit vel elit ornare sodales suscipit nec
              urna. Maecenas vitae sapien sem. Nam aliquam suscipit pretium. Pellentesque a odio
              mauris. Maecenas et neque ac mi maximus gravida. Nullam eu scelerisque tellus, id
              consectetur nulla. Vestibulum volutpat, justo sed elementum bibendum, purus arcu
              accumsan purus, et sagittis lectus mauris nec orci. Nunc malesuada vitae orci sit amet
              maximus. Suspendisse vel consectetur risus, a porttitor velit. Nullam eu ante eget
              magna lobortis congue. Phasellus molestie sollicitudin dolor.
            </p>
          </ScrollContentWrapper>
          <ScrollContentWrapper id="state-of-land" title="State of Land">
            <h1>State of Land</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus turpis arcu,
              lobortis sit amet vehicula ac, maximus sed felis. Aenean pharetra mattis ante sit amet
              sollicitudin. Nunc eu iaculis lacus. Curabitur euismod odio volutpat, commodo felis
              ac, rutrum mi. Sed orci magna, mattis vel pulvinar in, tempus quis dolor. Aliquam
              sodales vitae arcu nec posuere. Cras eget posuere nulla. Praesent nibh arcu, tincidunt
              at sodales quis, consectetur et lacus. Vivamus malesuada eleifend gravida. Nam
              ullamcorper, mi commodo tempus convallis, augue sem efficitur justo, ac finibus leo
              velit ut augue. Vestibulum sagittis elit id porta molestie. Duis ut tellus in tortor
              gravida congue. Vestibulum molestie hendrerit arcu, vitae accumsan orci blandit vel.
              Mauris nec lorem sit amet quam consectetur fringilla. Mauris sapien risus, cursus eu
              aliquam sed, vulputate ut lorem. Nam nec tellus at libero euismod auctor ac nec massa.
              Curabitur tincidunt blandit mollis. Suspendisse interdum eu justo non mollis. Proin eu
              nibh faucibus, faucibus dolor viverra, pharetra erat. Integer non arcu non nunc
              vestibulum laoreet. Sed sagittis volutpat nibh. Proin sed odio quis mauris mollis
              auctor. Morbi egestas nunc interdum mauris auctor, sit amet dignissim tortor mollis.
              Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam dui tortor,
              fringilla euismod volutpat efficitur, sollicitudin vel augue. Proin neque lectus,
              sodales eu sem ac, mattis elementum mauris. Morbi sollicitudin diam a mi pulvinar, ac
              pretium nisl porta. Donec quis maximus dui. Nam porta finibus eleifend. Curabitur
              gravida tincidunt rhoncus. Aliquam sagittis nulla eget lorem suscipit tempus. Integer
              id ipsum in sapien imperdiet egestas in vel eros. Duis quis risus erat. Mauris
              volutpat consectetur est quis mattis. Vestibulum quis dignissim ex, ac vehicula velit.
              Donec tristique faucibus lacus et sodales. In hac habitasse platea dictumst. Mauris
              euismod pharetra ante in volutpat. In cursus justo non elementum venenatis. In
              pharetra sed nisi ac dapibus. Maecenas vel arcu nec ex vulputate luctus eu et felis.
              Vestibulum tempor egestas nibh nec elementum. Maecenas mattis condimentum odio, at
              lobortis dui posuere non. Mauris luctus leo vel lectus ultricies dapibus. Nullam
              fermentum aliquam ultrices. Donec egestas sit amet neque congue efficitur. Sed iaculis
              turpis sed venenatis eleifend. Sed quis velit vel elit ornare sodales suscipit nec
              urna. Maecenas vitae sapien sem. Nam aliquam suscipit pretium. Pellentesque a odio
              mauris. Maecenas et neque ac mi maximus gravida. Nullam eu scelerisque tellus, id
              consectetur nulla. Vestibulum volutpat, justo sed elementum bibendum, purus arcu
              accumsan purus, et sagittis lectus mauris nec orci. Nunc malesuada vitae orci sit amet
              maximus. Suspendisse vel consectetur risus, a porttitor velit. Nullam eu ante eget
              magna lobortis congue. Phasellus molestie sollicitudin dolor.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus turpis arcu,
              lobortis sit amet vehicula ac, maximus sed felis. Aenean pharetra mattis ante sit amet
              sollicitudin. Nunc eu iaculis lacus. Curabitur euismod odio volutpat, commodo felis
              ac, rutrum mi. Sed orci magna, mattis vel pulvinar in, tempus quis dolor. Aliquam
              sodales vitae arcu nec posuere. Cras eget posuere nulla. Praesent nibh arcu, tincidunt
              at sodales quis, consectetur et lacus. Vivamus malesuada eleifend gravida. Nam
              ullamcorper, mi commodo tempus convallis, augue sem efficitur justo, ac finibus leo
              velit ut augue. Vestibulum sagittis elit id porta molestie. Duis ut tellus in tortor
              gravida congue. Vestibulum molestie hendrerit arcu, vitae accumsan orci blandit vel.
              Mauris nec lorem sit amet quam consectetur fringilla. Mauris sapien risus, cursus eu
              aliquam sed, vulputate ut lorem. Nam nec tellus at libero euismod auctor ac nec massa.
              Curabitur tincidunt blandit mollis. Suspendisse interdum eu justo non mollis. Proin eu
              nibh faucibus, faucibus dolor viverra, pharetra erat. Integer non arcu non nunc
              vestibulum laoreet. Sed sagittis volutpat nibh. Proin sed odio quis mauris mollis
              auctor. Morbi egestas nunc interdum mauris auctor, sit amet dignissim tortor mollis.
              Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam dui tortor,
              fringilla euismod volutpat efficitur, sollicitudin vel augue. Proin neque lectus,
              sodales eu sem ac, mattis elementum mauris. Morbi sollicitudin diam a mi pulvinar, ac
              pretium nisl porta. Donec quis maximus dui. Nam porta finibus eleifend. Curabitur
              gravida tincidunt rhoncus. Aliquam sagittis nulla eget lorem suscipit tempus. Integer
              id ipsum in sapien imperdiet egestas in vel eros. Duis quis risus erat. Mauris
              volutpat consectetur est quis mattis. Vestibulum quis dignissim ex, ac vehicula velit.
              Donec tristique faucibus lacus et sodales. In hac habitasse platea dictumst. Mauris
              euismod pharetra ante in volutpat. In cursus justo non elementum venenatis. In
              pharetra sed nisi ac dapibus. Maecenas vel arcu nec ex vulputate luctus eu et felis.
              Vestibulum tempor egestas nibh nec elementum. Maecenas mattis condimentum odio, at
              lobortis dui posuere non. Mauris luctus leo vel lectus ultricies dapibus. Nullam
              fermentum aliquam ultrices. Donec egestas sit amet neque congue efficitur. Sed iaculis
              turpis sed venenatis eleifend. Sed quis velit vel elit ornare sodales suscipit nec
              urna. Maecenas vitae sapien sem. Nam aliquam suscipit pretium. Pellentesque a odio
              mauris. Maecenas et neque ac mi maximus gravida. Nullam eu scelerisque tellus, id
              consectetur nulla. Vestibulum volutpat, justo sed elementum bibendum, purus arcu
              accumsan purus, et sagittis lectus mauris nec orci. Nunc malesuada vitae orci sit amet
              maximus. Suspendisse vel consectetur risus, a porttitor velit. Nullam eu ante eget
              magna lobortis congue. Phasellus molestie sollicitudin dolor.
            </p>
          </ScrollContentWrapper>
        </div>
      </Form>
    </div>
  );
};

NOWReview.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_NOTICE_OF_WORK,
  touchOnBlur: true,
})(NOWReview);
