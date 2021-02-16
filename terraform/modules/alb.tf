# alb.tf

resource "aws_alb" "main" {
  name            = "sample-load-balancer"
  subnets         = module.network.aws_subnet_ids.web.ids
  internal        = true
  security_groups = [aws_security_group.lb.id]

  tags = local.common_tags
}

resource "aws_alb_target_group" "app" {
  name                 = "sample-target-group"
  port                 = var.app_port
  protocol             = "HTTP"
  vpc_id               = module.network.aws_vpc.id
  target_type          = "ip"
  deregistration_delay = 30

  health_check {
    healthy_threshold   = "2"
    interval            = "5"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = var.health_check_path
    unhealthy_threshold = "2"
  }

  tags = local.common_tags
}

# Redirect all traffic from the ALB to the target group
resource "aws_alb_listener" "front_end" {
  load_balancer_arn = aws_alb.main.id
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.sample_cert.arn


  default_action {
    target_group_arn = aws_alb_target_group.app.id
    type             = "forward"
  }
}

# Find a certificate that is issued
data "aws_acm_certificate" "sample_cert" {
  domain   = var.alb_cert_domain
  statuses = ["ISSUED"]
}
